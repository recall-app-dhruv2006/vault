"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/client-server";
import { requireUser } from "@/lib/auth/current-user";
import type { Database } from "@/types/database";

export type ActionResult = { success: true } | { success: false; error: string };

export async function updateProfileAction(input: { displayName: string }): Promise<ActionResult> {
  const { userId } = await requireUser();
  if (!input.displayName.trim()) return { success: false, error: "Name can't be empty." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ display_name: input.displayName.trim() }).eq("id", userId);
  if (error) return { success: false, error: "Couldn't update profile." };
  revalidatePath("/settings");
  return { success: true };
}

export async function updateSettingsAction(input: Database["public"]["Tables"]["user_settings"]["Update"]): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("user_settings").update(input).eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't save settings." };
  revalidatePath("/settings");
  return { success: true };
}

export async function clearSearchHistoryAction(): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("search_history").delete().eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't clear search history." };
  revalidatePath("/settings");
  return { success: true };
}

/** Builds a JSON export of everything the user has saved. Pro-gated in the UI; the export itself works for any plan since it's core to the Privacy Center promise. */
export async function exportDataAction(): Promise<{ success: true; data: string } | { success: false; error: string }> {
  const { userId } = await requireUser();
  const supabase = await createClient();

  const [items, collections, tags, receipts] = await Promise.all([
    supabase.from("items").select("*").eq("user_id", userId).is("deleted_at", null),
    supabase.from("collections").select("*").eq("user_id", userId),
    supabase.from("tags").select("*").eq("user_id", userId),
    supabase.from("receipts").select("*").eq("user_id", userId),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    items: items.data ?? [],
    collections: collections.data ?? [],
    tags: tags.data ?? [],
    receipts: receipts.data ?? [],
  };

  return { success: true, data: JSON.stringify(exportPayload, null, 2) };
}
