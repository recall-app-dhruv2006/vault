"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/client-server";
import { requireUser } from "@/lib/auth/current-user";
import { createCollectionSchema } from "@/lib/validation/items";
import { getCollectionLimit } from "@/lib/subscriptions/entitlements";

export type ActionResult = { success: true; id?: string } | { success: false; error: string };

export async function createCollectionAction(input: unknown): Promise<ActionResult> {
  const { userId, profile } = await requireUser();
  const parsed = createCollectionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid collection." };

  const supabase = await createClient();
  const { count } = await supabase.from("collections").select("id", { count: "exact", head: true }).eq("user_id", userId);
  const limit = getCollectionLimit(profile.plan);
  if (limit !== Infinity && (count ?? 0) >= limit) {
    return { success: false, error: `You've reached the ${limit}-collection limit on the Free plan. Upgrade to Pro for unlimited collections.` };
  }

  const { data, error } = await supabase
    .from("collections")
    .insert({ user_id: userId, name: parsed.data.name, description: parsed.data.description, icon: parsed.data.icon ?? "folder" })
    .select("id")
    .single();
  if (error || !data) return { success: false, error: "Couldn't create collection." };

  revalidatePath("/collections");
  return { success: true, id: data.id };
}

export async function deleteCollectionAction(collectionId: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("collections").delete().eq("id", collectionId).eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't delete collection." };
  revalidatePath("/collections");
  return { success: true };
}

export async function addItemToCollectionAction(collectionId: string, itemId: string): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("collection_items").upsert({ collection_id: collectionId, item_id: itemId });
  if (error) return { success: false, error: "Couldn't add item to collection." };
  revalidatePath(`/collections/${collectionId}`);
  revalidatePath(`/item/${itemId}`);
  return { success: true };
}

export async function removeItemFromCollectionAction(collectionId: string, itemId: string): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("collection_items").delete().eq("collection_id", collectionId).eq("item_id", itemId);
  if (error) return { success: false, error: "Couldn't remove item from collection." };
  revalidatePath(`/collections/${collectionId}`);
  revalidatePath(`/item/${itemId}`);
  return { success: true };
}
