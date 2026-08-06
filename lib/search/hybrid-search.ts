import "server-only";
import { createClient } from "@/lib/db/client-server";
import { interpretQuery } from "@/lib/ai/search-query";
import { generateEmbedding } from "@/lib/ai/generate-embedding";
import type { SearchQueryInput } from "@/lib/validation/items";
import type { Database, ItemType } from "@/types/database";
import { getSignedUrl } from "@/lib/storage/files";
import { computeFinalScore, computeRecencyScore } from "@/lib/search/scoring";

type Item = Database["public"]["Tables"]["items"]["Row"];
export type SearchResultItem = Item & {
  thumbnailUrl: string | null;
  fileUrl: string | null;
  score: number;
  matchExplanation: string;
};

interface Signal {
  semantic: number;
  keyword: number;
  metadata: number;
  matchedOn: Set<string>;
  matchedText?: string;
  matchedPage?: number;
}

export async function hybridSearch(userId: string, params: SearchQueryInput): Promise<{ results: SearchResultItem[]; interpretedQuery: string }> {
  const supabase = await createClient();
  const trimmedQuery = params.query.trim();

  const intent = trimmedQuery ? await interpretQuery(trimmedQuery) : null;
  const contentTypes = params.contentTypes?.length ? params.contentTypes : intent?.contentTypes ?? [];
  const favoriteOnly = params.favoriteOnly ?? intent?.favoriteOnly ?? false;
  const minimumPrice = params.minimumPrice ?? intent?.minimumPrice ?? undefined;
  const maximumPrice = params.maximumPrice ?? intent?.maximumPrice ?? undefined;
  const hasReturnDeadline = params.hasReturnDeadline ?? intent?.hasReturnDeadline ?? false;

  const signals = new Map<string, Signal>();
  const semanticQuery = intent?.semanticQuery || trimmedQuery;

  // --- Semantic signal -----------------------------------------------------
  if (semanticQuery) {
    try {
      const embedding = await generateEmbedding(semanticQuery);
      const { data: matches } = await supabase.rpc("match_item_embeddings", {
        query_embedding: JSON.stringify(embedding),
        match_user_id: userId,
        match_count: 60,
        similarity_threshold: 0.12,
      });
      for (const match of matches ?? []) {
        const signal = getSignal(signals, match.item_id);
        if (match.similarity > signal.semantic) {
          signal.semantic = match.similarity;
          signal.matchedText = match.chunk_content;
          signal.matchedPage = match.page_number ?? undefined;
        }
        signal.matchedOn.add("semantic");
      }
    } catch (error) {
      console.error("[search] semantic search failed", error);
    }
  }

  // --- Keyword (full-text) signal -------------------------------------------
  if (trimmedQuery) {
    const { data: ftsMatches } = await supabase.rpc("search_items_fts", { search_query: trimmedQuery, match_user_id: userId, match_count: 60 });
    const maxRank = Math.max(...(ftsMatches ?? []).map((m) => m.rank), 0.0001);
    for (const match of ftsMatches ?? []) {
      const signal = getSignal(signals, match.item_id);
      signal.keyword = Math.max(signal.keyword, match.rank / maxRank);
      signal.matchedOn.add("keyword");
    }

    // Exact title / tag matches boost metadata score directly.
    const { data: titleMatches } = await supabase
      .from("items")
      .select("id")
      .eq("user_id", userId)
      .ilike("title", `%${trimmedQuery}%`)
      .is("deleted_at", null)
      .limit(30);
    for (const row of titleMatches ?? []) {
      const signal = getSignal(signals, row.id);
      signal.metadata = Math.max(signal.metadata, 0.9);
      signal.matchedOn.add("title");
    }

    const { data: tagMatches } = await supabase
      .from("tags")
      .select("id, name, item_tags(item_id)")
      .eq("user_id", userId)
      .ilike("name", `%${trimmedQuery}%`);
    for (const tag of tagMatches ?? []) {
      for (const link of tag.item_tags as { item_id: string }[]) {
        const signal = getSignal(signals, link.item_id);
        signal.metadata = Math.max(signal.metadata, 0.8);
        signal.matchedOn.add("tag");
      }
    }
  }

  // --- Metadata filters: domain, tags list, favorite, price, return deadline -----
  if (intent?.merchantOrDomain) {
    const { data } = await supabase.from("items").select("id").eq("user_id", userId).ilike("source_domain", `%${intent.merchantOrDomain}%`).is("deleted_at", null);
    for (const row of data ?? []) {
      const signal = getSignal(signals, row.id);
      signal.metadata = Math.max(signal.metadata, 0.7);
      signal.matchedOn.add("domain");
    }
  }

  // If there's no text query at all, fall back to browsing recent items so filters alone still work.
  if (!trimmedQuery && signals.size === 0) {
    const { data } = await supabase.from("items").select("id").eq("user_id", userId).is("deleted_at", null).order("created_at", { ascending: false }).limit(60);
    for (const row of data ?? []) getSignal(signals, row.id).matchedOn.add("recent");
  }

  if (signals.size === 0) return { results: [], interpretedQuery: semanticQuery };

  // --- Fetch full item rows for candidates, applying hard filters --------------
  let query = supabase.from("items").select("*").eq("user_id", userId).is("deleted_at", null).in("id", Array.from(signals.keys()));
  if (contentTypes.length) query = query.in("item_type", contentTypes as ItemType[]);
  if (favoriteOnly) query = query.eq("is_favorite", true);
  if (params.collectionId) {
    const { data: memberRows } = await supabase.from("collection_items").select("item_id").eq("collection_id", params.collectionId);
    const memberIds = new Set((memberRows ?? []).map((r) => r.item_id));
    query = query.in("id", Array.from(signals.keys()).filter((id) => memberIds.has(id)));
  }

  const { data: items } = await query;
  if (!items?.length) return { results: [], interpretedQuery: semanticQuery };

  // Price + return-deadline filters require a receipts join; fetch once.
  let priceByItem = new Map<string, number>();
  let returnDeadlineItems = new Set<string>();
  if (minimumPrice !== undefined || maximumPrice !== undefined || hasReturnDeadline) {
    const { data: receipts } = await supabase.from("receipts").select("item_id, total, return_status").eq("user_id", userId).in("item_id", items.map((i) => i.id));
    for (const r of receipts ?? []) {
      if (r.total !== null) priceByItem.set(r.item_id, r.total);
      if (r.return_status === "open") returnDeadlineItems.add(r.item_id);
    }
  }

  const now = Date.now();
  const results: SearchResultItem[] = [];

  for (const item of items) {
    if (minimumPrice !== undefined && (priceByItem.get(item.id) ?? -Infinity) < minimumPrice) continue;
    if (maximumPrice !== undefined && (priceByItem.get(item.id) ?? Infinity) > maximumPrice) continue;
    if (hasReturnDeadline && !returnDeadlineItems.has(item.id)) continue;

    const signal = signals.get(item.id)!;
    const recencyScore = computeRecencyScore(new Date(item.created_at), new Date(now));
    const interactionScore = item.last_viewed_at ? 0.5 : 0;

    const score = computeFinalScore({
      semantic: signal.semantic,
      keyword: signal.keyword,
      metadata: signal.metadata,
      recency: recencyScore,
      interaction: interactionScore,
    });

    results.push({
      ...item,
      thumbnailUrl: item.thumbnail_path ? await getSignedUrl("thumbnails", item.thumbnail_path) : null,
      fileUrl: item.storage_path ? await getSignedUrl("originals", item.storage_path) : null,
      score,
      matchExplanation: buildExplanation(item, signal, trimmedQuery),
    });
  }

  results.sort((a, b) => b.score - a.score);

  const sort = params.sort ?? "relevance";
  if (sort === "recent") results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (sort === "oldest") results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return { results, interpretedQuery: semanticQuery };
}

function getSignal(map: Map<string, Signal>, itemId: string): Signal {
  if (!map.has(itemId)) map.set(itemId, { semantic: 0, keyword: 0, metadata: 0, matchedOn: new Set() });
  return map.get(itemId)!;
}

function buildExplanation(item: Item, signal: Signal, query: string): string {
  if (signal.matchedOn.has("title")) return `Matched "${query}" in the title.`;
  if (signal.matchedPage) return `Matched text on page ${signal.matchedPage} of the document.`;
  if (signal.matchedOn.has("tag")) return `Matched "${query}" in your tags.`;
  if (signal.matchedOn.has("domain")) return `Matched the site or merchant "${item.source_domain}".`;
  if (signal.semantic > 0.4) return `Semantically related to "${query}" in the saved description.`;
  if (signal.matchedOn.has("keyword")) return `Matched "${query}" in the extracted text.`;
  if (signal.matchedOn.has("recent")) return "Recently saved.";
  return `Related to "${query}".`;
}
