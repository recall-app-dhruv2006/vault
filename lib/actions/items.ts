"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/client-server";
import { createServiceClient } from "@/lib/db/client-service";
import { requireUser } from "@/lib/auth/current-user";
import { saveNoteSchema, saveLinkSchema, updateItemSchema } from "@/lib/validation/items";
import { assertFileConstraints } from "@/lib/security/sanitize";
import { assertSafeUrl } from "@/lib/security/ssrf";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { uploadOriginal, uploadThumbnail, deleteStorageObjects } from "@/lib/storage/files";
import { getMaxFileSizeBytes, getMaxPdfPages, isOverItemLimit } from "@/lib/subscriptions/entitlements";
import {
  processNoteItem, processLinkItem, processImageItem, processPdfItem, processReceiptItem,
} from "@/lib/processing/pipeline";
import { extractPdfText } from "@/lib/processing/extract-pdf";
import type { Database } from "@/types/database";

export type ActionResult = { success: true; itemId: string } | { success: false; error: string };

async function assertUnderItemLimit(userId: string, plan: "free" | "pro") {
  const supabase = await createClient();
  const { count } = await supabase.from("items").select("id", { count: "exact", head: true }).eq("user_id", userId).is("deleted_at", null);
  if (isOverItemLimit(plan, count ?? 0)) {
    throw new Error(`You've reached the ${plan === "free" ? "Free" : "Pro"} plan limit for saved items. Upgrade to save more.`);
  }
}

export async function saveNoteAction(input: unknown): Promise<ActionResult> {
  try {
    const { userId, profile } = await requireUser();
    const parsed = saveNoteSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid note." };
    await assertUnderItemLimit(userId, profile.plan);

    const supabase = await createClient();
    const { data: item, error } = await supabase
      .from("items")
      .insert({
        user_id: userId,
        item_type: "note",
        title: parsed.data.title,
        raw_text: parsed.data.content,
        is_favorite: parsed.data.isFavorite ?? false,
        processing_status: "queued",
      })
      .select("id")
      .single();
    if (error || !item) return { success: false, error: "Couldn't save your note. Please try again." };

    if (parsed.data.collectionId) {
      await supabase.from("collection_items").insert({ collection_id: parsed.data.collectionId, item_id: item.id });
    }

    await processNoteItem(item.id, userId, parsed.data.title, parsed.data.content);
    revalidatePath("/home");
    revalidatePath("/items");
    return { success: true, itemId: item.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Something went wrong." };
  }
}

export async function saveLinkAction(input: unknown): Promise<ActionResult> {
  try {
    const { userId, profile } = await requireUser();
    const parsed = saveLinkSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Enter a valid URL." };
    await assertUnderItemLimit(userId, profile.plan);

    await assertSafeUrl(parsed.data.url); // fail fast before creating a row for an unsafe URL

    const rateLimit = await checkRateLimit({ userId, action: "save_link", limit: 60, windowMs: 60 * 60 * 1000 });
    if (!rateLimit.allowed) return { success: false, error: "You're saving links too quickly. Please wait a moment." };

    const supabase = await createClient();
    const { data: item, error } = await supabase
      .from("items")
      .insert({
        user_id: userId,
        item_type: "link",
        title: parsed.data.url,
        source_url: parsed.data.url,
        processing_status: "queued",
      })
      .select("id")
      .single();
    if (error || !item) return { success: false, error: "Couldn't save this link. Please try again." };

    if (parsed.data.collectionId) {
      await supabase.from("collection_items").insert({ collection_id: parsed.data.collectionId, item_id: item.id });
    }

    await processLinkItem(item.id, userId, parsed.data.url);
    revalidatePath("/home");
    revalidatePath("/items");
    return { success: true, itemId: item.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "We couldn't fetch that link." };
  }
}

export async function saveImageAction(formData: FormData): Promise<ActionResult> {
  try {
    const { userId, profile } = await requireUser();
    await assertUnderItemLimit(userId, profile.plan);

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { success: false, error: "Choose an image to upload." };
    assertFileConstraints({ size: file.size, type: file.type }, getMaxFileSizeBytes(profile.plan));

    const supabase = await createClient();
    const { data: item, error } = await supabase
      .from("items")
      .insert({
        user_id: userId,
        item_type: "image",
        title: file.name || "Untitled image",
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        processing_status: "queued",
      })
      .select("id")
      .single();
    if (error || !item) return { success: false, error: "Couldn't save this image. Please try again." };

    const bytes = Buffer.from(await file.arrayBuffer());
    const storagePath = await uploadOriginal({ userId, itemId: item.id, filename: file.name, mimeType: file.type, bytes });
    const thumbnailPath = await uploadThumbnail({ userId, itemId: item.id, sourceBytes: bytes });
    await supabase.from("items").update({ storage_path: storagePath, thumbnail_path: thumbnailPath }).eq("id", item.id);

    const base64 = bytes.toString("base64");
    await processImageItem(item.id, userId, base64, file.type);

    revalidatePath("/home");
    revalidatePath("/items");
    return { success: true, itemId: item.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Upload failed. Please try again." };
  }
}

export async function savePdfAction(formData: FormData): Promise<ActionResult> {
  try {
    const { userId, profile } = await requireUser();
    await assertUnderItemLimit(userId, profile.plan);

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { success: false, error: "Choose a PDF to upload." };
    if (file.type !== "application/pdf") return { success: false, error: "Only PDF files are supported here." };
    assertFileConstraints({ size: file.size, type: file.type }, getMaxFileSizeBytes(profile.plan));

    const supabase = await createClient();
    const { data: item, error } = await supabase
      .from("items")
      .insert({
        user_id: userId,
        item_type: "pdf",
        title: file.name || "Untitled document",
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        processing_status: "queued",
      })
      .select("id")
      .single();
    if (error || !item) return { success: false, error: "Couldn't save this PDF. Please try again." };

    const bytes = Buffer.from(await file.arrayBuffer());
    const storagePath = await uploadOriginal({ userId, itemId: item.id, filename: file.name, mimeType: file.type, bytes });
    await supabase.from("items").update({ storage_path: storagePath }).eq("id", item.id);

    await processPdfItem(item.id, userId, bytes, getMaxPdfPages(profile.plan));

    revalidatePath("/home");
    revalidatePath("/items");
    return { success: true, itemId: item.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "PDF processing failed. Please try again." };
  }
}

export async function saveReceiptAction(formData: FormData): Promise<ActionResult> {
  try {
    const { userId, profile } = await requireUser();
    await assertUnderItemLimit(userId, profile.plan);

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { success: false, error: "Choose a receipt image or PDF to upload." };
    assertFileConstraints({ size: file.size, type: file.type }, getMaxFileSizeBytes(profile.plan));

    const supabase = await createClient();
    const { data: item, error } = await supabase
      .from("items")
      .insert({
        user_id: userId,
        item_type: "receipt",
        title: file.name || "Receipt",
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
        processing_status: "queued",
      })
      .select("id")
      .single();
    if (error || !item) return { success: false, error: "Couldn't save this receipt. Please try again." };

    const bytes = Buffer.from(await file.arrayBuffer());
    const storagePath = await uploadOriginal({ userId, itemId: item.id, filename: file.name, mimeType: file.type, bytes });
    const thumbnailPath = file.type.startsWith("image/") ? await uploadThumbnail({ userId, itemId: item.id, sourceBytes: bytes }) : null;
    await supabase.from("items").update({ storage_path: storagePath, thumbnail_path: thumbnailPath }).eq("id", item.id);

    if (file.type === "application/pdf") {
      const extraction = await extractPdfText(bytes, 10);
      await processReceiptItem(item.id, userId, { text: extraction.text });
    } else {
      await processReceiptItem(item.id, userId, { imageBase64: bytes.toString("base64"), mimeType: file.type });
    }

    revalidatePath("/home");
    revalidatePath("/receipts");
    return { success: true, itemId: item.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Receipt processing failed. Please try again." };
  }
}

export async function retryProcessingAction(itemId: string): Promise<ActionResult> {
  try {
    const { userId } = await requireUser();
    const supabase = await createClient();
    const { data: item } = await supabase.from("items").select("*").eq("id", itemId).eq("user_id", userId).single();
    if (!item) return { success: false, error: "Item not found." };

    if (item.item_type === "note") {
      await processNoteItem(item.id, userId, item.title, item.raw_text ?? "");
    } else if (item.item_type === "link" && item.source_url) {
      await processLinkItem(item.id, userId, item.source_url);
    } else if (item.storage_path) {
      const service = createServiceClient();
      const { data: file, error } = await service.storage.from("originals").download(item.storage_path);
      if (error || !file) return { success: false, error: "The original file is missing and can't be reprocessed." };
      const bytes = Buffer.from(await file.arrayBuffer());

      if (item.item_type === "image") {
        await processImageItem(item.id, userId, bytes.toString("base64"), item.mime_type ?? "image/jpeg");
      } else if (item.item_type === "pdf") {
        await processPdfItem(item.id, userId, bytes, 300);
      } else if (item.item_type === "receipt") {
        if (item.mime_type === "application/pdf") {
          const extraction = await extractPdfText(bytes, 10);
          await processReceiptItem(item.id, userId, { text: extraction.text });
        } else {
          await processReceiptItem(item.id, userId, { imageBase64: bytes.toString("base64"), mimeType: item.mime_type ?? "image/jpeg" });
        }
      }
    } else {
      return { success: false, error: "This item has no original file to reprocess." };
    }

    revalidatePath(`/item/${itemId}`);
    return { success: true, itemId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Retry failed. Please try again." };
  }
}

export async function updateItemAction(input: unknown): Promise<ActionResult> {
  const { userId } = await requireUser();
  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid update." };

  const supabase = await createClient();
  const { data: current } = await supabase.from("items").select("ai_analysis, user_corrections").eq("id", parsed.data.id).eq("user_id", userId).single();
  if (!current) return { success: false, error: "Item not found." };

  const corrections = { ...(current.user_corrections as Record<string, unknown>) };
  const updates: Database["public"]["Tables"]["items"]["Update"] = {};
  if (parsed.data.title !== undefined) { updates.title = parsed.data.title; corrections.title = parsed.data.title; }
  if (parsed.data.summary !== undefined) { updates.summary = parsed.data.summary; corrections.summary = parsed.data.summary; }
  if (parsed.data.isFavorite !== undefined) updates.is_favorite = parsed.data.isFavorite;
  updates.user_corrections = corrections;

  const { error } = await supabase.from("items").update(updates).eq("id", parsed.data.id).eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't save your changes." };

  if (parsed.data.tags) {
    await supabase.from("item_tags").delete().eq("item_id", parsed.data.id);
    for (const rawName of parsed.data.tags) {
      const name = rawName.trim();
      if (!name) continue;
      const normalized = name.toLowerCase().replace(/\s+/g, "-");
      const { data: existing } = await supabase.from("tags").select("id").eq("user_id", userId).eq("normalized_name", normalized).maybeSingle();
      const tagId = existing?.id ?? (await supabase.from("tags").insert({ user_id: userId, name, normalized_name: normalized }).select("id").single()).data?.id;
      if (tagId) await supabase.from("item_tags").upsert({ item_id: parsed.data.id, tag_id: tagId });
    }
  }

  revalidatePath(`/item/${parsed.data.id}`);
  return { success: true, itemId: parsed.data.id };
}

export async function toggleFavoriteAction(itemId: string, isFavorite: boolean): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("items").update({ is_favorite: isFavorite }).eq("id", itemId).eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't update favorite." };
  revalidatePath("/favorites");
  revalidatePath("/home");
  return { success: true, itemId };
}

export async function moveToTrashAction(itemId: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("items").update({ deleted_at: new Date().toISOString() }).eq("id", itemId).eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't delete this item." };
  revalidatePath("/items");
  revalidatePath("/trash");
  return { success: true, itemId };
}

export async function restoreFromTrashAction(itemId: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("items").update({ deleted_at: null }).eq("id", itemId).eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't restore this item." };
  revalidatePath("/items");
  revalidatePath("/trash");
  return { success: true, itemId };
}

export async function permanentlyDeleteItemAction(itemId: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { data: item } = await supabase.from("items").select("storage_path, thumbnail_path").eq("id", itemId).eq("user_id", userId).single();
  if (!item) return { success: false, error: "Item not found." };

  const paths = [
    item.storage_path ? { bucket: "originals" as const, path: item.storage_path } : null,
    item.thumbnail_path ? { bucket: "thumbnails" as const, path: item.thumbnail_path } : null,
  ].filter(Boolean) as { bucket: "originals" | "thumbnails"; path: string }[];
  if (paths.length) await deleteStorageObjects(paths);

  // item_embeddings, item_tags, collection_items, receipts all cascade via FK on items.id.
  const { error } = await supabase.from("items").delete().eq("id", itemId).eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't permanently delete this item." };

  revalidatePath("/trash");
  return { success: true, itemId };
}

export async function emptyTrashAction(): Promise<{ success: true; deletedCount: number } | { success: false; error: string }> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { data: items } = await supabase.from("items").select("id, storage_path, thumbnail_path").eq("user_id", userId).not("deleted_at", "is", null);
  if (!items?.length) return { success: true, deletedCount: 0 };

  const paths = items.flatMap((item) => [
    item.storage_path ? { bucket: "originals" as const, path: item.storage_path } : null,
    item.thumbnail_path ? { bucket: "thumbnails" as const, path: item.thumbnail_path } : null,
  ]).filter(Boolean) as { bucket: "originals" | "thumbnails"; path: string }[];
  if (paths.length) await deleteStorageObjects(paths);

  const { error } = await supabase.from("items").delete().eq("user_id", userId).not("deleted_at", "is", null);
  if (error) return { success: false, error: "Couldn't empty trash." };

  revalidatePath("/trash");
  return { success: true, deletedCount: items.length };
}
