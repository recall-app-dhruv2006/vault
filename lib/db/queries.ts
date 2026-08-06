import "server-only";
import { createClient } from "@/lib/db/client-server";
import { getSignedUrl } from "@/lib/storage/files";
import type { Database, ItemType } from "@/types/database";

type Item = Database["public"]["Tables"]["items"]["Row"];
export type ItemWithUrls = Item & { thumbnailUrl: string | null; fileUrl: string | null };

async function attachUrls(items: Item[]): Promise<ItemWithUrls[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      thumbnailUrl: item.thumbnail_path ? await getSignedUrl("thumbnails", item.thumbnail_path) : null,
      fileUrl: item.storage_path ? await getSignedUrl("originals", item.storage_path) : null,
    }))
  );
}

export async function getItemCounts(userId: string) {
  const supabase = await createClient();
  const [{ count: total }, { count: favorites }, { count: needsReview }] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", userId).is("deleted_at", null),
    supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_favorite", true).is("deleted_at", null),
    supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("processing_status", "needs_review").is("deleted_at", null),
  ]);
  return { total: total ?? 0, favorites: favorites ?? 0, needsReview: needsReview ?? 0 };
}

export async function getItemCountsByType(userId: string): Promise<Record<ItemType, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("items").select("item_type").eq("user_id", userId).is("deleted_at", null);
  const counts: Record<ItemType, number> = { link: 0, image: 0, pdf: 0, note: 0, receipt: 0 };
  for (const row of data ?? []) counts[row.item_type as ItemType] += 1;
  return counts;
}

export async function getRecentItems(userId: string, limit = 12): Promise<ItemWithUrls[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachUrls(data ?? []);
}

export async function getItemsByType(userId: string, itemType: ItemType, opts: { limit?: number; offset?: number } = {}): Promise<ItemWithUrls[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 24) - 1);
  return attachUrls(data ?? []);
}

export async function getAllItems(userId: string, opts: { limit?: number; offset?: number; sort?: "recent" | "oldest" | "title" } = {}): Promise<ItemWithUrls[]> {
  const supabase = await createClient();
  let query = supabase.from("items").select("*").eq("user_id", userId).is("deleted_at", null);
  if (opts.sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (opts.sort === "title") query = query.order("title", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data } = await query.range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 24) - 1);
  return attachUrls(data ?? []);
}

export async function getFavoriteItems(userId: string): Promise<ItemWithUrls[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .eq("is_favorite", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return attachUrls(data ?? []);
}

export async function getTrashedItems(userId: string): Promise<ItemWithUrls[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });
  return attachUrls(data ?? []);
}

export async function getItemById(userId: string, itemId: string): Promise<ItemWithUrls | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("items").select("*").eq("user_id", userId).eq("id", itemId).maybeSingle();
  if (!data) return null;
  const [withUrl] = await attachUrls([data]);
  return withUrl ?? null;
}

export async function getItemTags(itemId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("item_tags").select("tags(id, name)").eq("item_id", itemId);
  return (data ?? []).map((row) => row.tags).filter(Boolean) as { id: string; name: string }[];
}

export async function getUserTags(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("id, name").eq("user_id", userId).order("name");
  return data ?? [];
}

export async function getCollections(userId: string) {
  const supabase = await createClient();
  const { data: collections } = await supabase.from("collections").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (!collections) return [];

  const counts = await Promise.all(
    collections.map((c) => supabase.from("collection_items").select("item_id", { count: "exact", head: true }).eq("collection_id", c.id))
  );
  return collections.map((c, i) => ({ ...c, itemCount: counts[i]?.count ?? 0 }));
}

export async function getCollectionById(userId: string, collectionId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("*").eq("user_id", userId).eq("id", collectionId).maybeSingle();
  return data;
}

export async function getCollectionItems(collectionId: string): Promise<ItemWithUrls[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collection_items")
    .select("items(*)")
    .eq("collection_id", collectionId)
    .order("added_at", { ascending: false });
  const items = (data ?? []).map((row) => row.items).filter(Boolean) as Item[];
  return attachUrls(items);
}

export async function getRelatedItems(userId: string, itemId: string, limit = 6): Promise<ItemWithUrls[]> {
  const supabase = await createClient();
  // Nearest-neighbor via the item's own embedding, excluding itself.
  const { data: embeddings } = await supabase.from("item_embeddings").select("embedding").eq("item_id", itemId).limit(1);
  const embedding = embeddings?.[0]?.embedding;
  if (!embedding) return [];

  const { data: matches } = await supabase.rpc("match_item_embeddings", {
    query_embedding: embedding as unknown as number[],
    match_user_id: userId,
    match_count: limit + 5,
    similarity_threshold: 0.3,
  });

  const ids = Array.from(new Set((matches ?? []).map((m) => m.item_id))).filter((id) => id !== itemId).slice(0, limit);
  if (!ids.length) return [];

  const { data: items } = await supabase.from("items").select("*").in("id", ids).is("deleted_at", null);
  return attachUrls(items ?? []);
}

export async function getItemCollectionIds(itemId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("collection_items").select("collection_id").eq("item_id", itemId);
  return (data ?? []).map((row) => row.collection_id);
}

export async function recordItemView(userId: string, itemId: string) {
  const supabase = await createClient();
  await supabase.from("item_views").insert({ user_id: userId, item_id: itemId });
  await supabase.from("items").update({ last_viewed_at: new Date().toISOString() }).eq("id", itemId);
}
