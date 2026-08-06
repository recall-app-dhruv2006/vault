import "server-only";
import { createClient } from "@/lib/db/client-server";
import { formatReturnDeadline } from "@/lib/utils/format";

export async function getReceiptByItemId(itemId: string) {
  const supabase = await createClient();
  const { data: receipt } = await supabase.from("receipts").select("*").eq("item_id", itemId).maybeSingle();
  if (!receipt) return null;
  const { data: lineItems } = await supabase.from("receipt_line_items").select("*").eq("receipt_id", receipt.id);
  return { ...receipt, lineItems: lineItems ?? [] };
}

export async function getAllReceipts(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receipts")
    .select("*, items(id, title, thumbnail_path, storage_path)")
    .eq("user_id", userId)
    .order("purchase_date", { ascending: false, nullsFirst: false });
  return data ?? [];
}

export async function getUpcomingReturns(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("receipts")
    .select("*, items(id, title, thumbnail_path)")
    .eq("user_id", userId)
    .eq("return_status", "open")
    .gte("return_deadline", today)
    .order("return_deadline", { ascending: true });
  return data ?? [];
}

export async function getPastReturns(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("receipts")
    .select("*, items(id, title, thumbnail_path)")
    .eq("user_id", userId)
    .in("return_status", ["open", "expired"])
    .lt("return_deadline", today)
    .order("return_deadline", { ascending: false });
  return data ?? [];
}

export async function getMonthlySpending(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("receipts").select("total, purchase_date, currency").eq("user_id", userId).not("total", "is", null);
  const byMonth = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.purchase_date || row.total === null) continue;
    const key = row.purchase_date.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + row.total);
  }
  return Array.from(byMonth.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6)
    .map(([month, total]) => ({ month, total }));
}

export { formatReturnDeadline };
