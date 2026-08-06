import "server-only";
import { createClient } from "@/lib/db/client-server";
import type { ItemType } from "@/types/database";

export interface MemoryInsights {
  savedThisWeek: number;
  mostCommonCategory: string | null;
  unorganizedCount: number;
  upcomingReturnDeadlines: number;
  recentlyRevisited: number;
}

export async function getMemoryInsights(userId: string): Promise<MemoryInsights> {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const today = new Date().toISOString().slice(0, 10);

  const [savedThisWeekRes, itemsRes, taggedRes, collectedRes, returnsRes, revisitedRes] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", userId).is("deleted_at", null).gte("created_at", weekAgo),
    supabase.from("items").select("id, content_category").eq("user_id", userId).is("deleted_at", null),
    supabase.from("item_tags").select("item_id"),
    supabase.from("collection_items").select("item_id"),
    supabase
      .from("receipts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("return_status", "open")
      .gte("return_deadline", today),
    supabase.from("item_views").select("item_id", { count: "exact", head: true }).eq("user_id", userId).gte("viewed_at", dayAgo),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const row of itemsRes.data ?? []) {
    categoryCounts.set(row.content_category, (categoryCounts.get(row.content_category) ?? 0) + 1);
  }
  let mostCommonCategory: string | null = null;
  let max = 0;
  for (const [category, count] of categoryCounts) {
    if (count > max) { max = count; mostCommonCategory = category; }
  }

  const organizedIds = new Set([...(taggedRes.data ?? []).map((r) => r.item_id), ...(collectedRes.data ?? []).map((r) => r.item_id)]);
  const unorganizedCount = (itemsRes.data ?? []).filter((item) => !organizedIds.has(item.id)).length;

  return {
    savedThisWeek: savedThisWeekRes.count ?? 0,
    mostCommonCategory,
    unorganizedCount,
    upcomingReturnDeadlines: returnsRes.count ?? 0,
    recentlyRevisited: revisitedRes.count ?? 0,
  };
}

/** Deterministic, content-aware suggested queries — no AI call needed for the MVP dashboard. */
export function buildSuggestedQueries(insights: MemoryInsights, typeCounts: Record<ItemType, number>): string[] {
  const suggestions: string[] = [];
  if (typeCounts.receipt > 0) suggestions.push("Which return deadlines are coming up?");
  if (typeCounts.link > 0) suggestions.push("Show recent shopping items");
  if (typeCounts.image > 0) suggestions.push("Show screenshots from this week");
  suggestions.push("Find travel ideas");
  suggestions.push("Show all saved recipes");
  suggestions.push("Show my favorites");
  return suggestions.slice(0, 4);
}
