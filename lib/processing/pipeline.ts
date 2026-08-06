import "server-only";
import { createServiceClient } from "@/lib/db/client-service";
import { analyzeItem } from "@/lib/ai/analyze-item";
import { extractReceipt } from "@/lib/ai/extract-receipt";
import { chunkText, generateEmbeddings } from "@/lib/ai/generate-embedding";
import { extractLinkMetadata, guessLinkCategory } from "@/lib/processing/extract-link";
import { extractPdfText } from "@/lib/processing/extract-pdf";
import type { ItemAnalysis } from "@/lib/ai/schemas";
import type { ProcessingStatus, Json } from "@/types/database";

/**
 * Server-side processing pipeline for the MVP.
 *
 * Every save flow inserts an `items` row with status "uploaded", then
 * calls the matching `process*Item` function here. Each function:
 *   1. Moves status to "processing"
 *   2. Extracts raw content (link metadata / PDF text / receipt OCR-ish pass)
 *   3. Runs AI analysis, generates embeddings
 *   4. Writes results and moves status to "completed"
 *   5. On any failure, writes "failed" + a user-readable processing_error
 *      and leaves the original upload untouched so retryItemProcessing can
 *      run again — an item is never silently lost.
 *
 * This runs inline within the request/server action rather than on a
 * separate queue, which is the pragmatic choice for an MVP on Vercel. For
 * production scale, swap the body of each process* function behind a real
 * queue (Vercel Queues, Inngest, or Supabase pg_cron + pgmq) without
 * changing any call sites — they're already async and idempotent per item.
 */

const MAX_ATTEMPTS = 3;

async function setStatus(itemId: string, status: ProcessingStatus, error?: string) {
  const supabase = createServiceClient();
  await supabase
    .from("items")
    .update({ processing_status: status, processing_error: error ?? null })
    .eq("id", itemId);
}

async function incrementAttempts(itemId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase.from("items").select("processing_attempts").eq("id", itemId).single();
  const attempts = (data?.processing_attempts ?? 0) + 1;
  await supabase.from("items").update({ processing_attempts: attempts }).eq("id", itemId);
  return attempts;
}

async function applyAnalysis(itemId: string, userId: string, analysis: ItemAnalysis, extra: Record<string, unknown> = {}) {
  const supabase = createServiceClient();
  await supabase
    .from("items")
    .update({
      title: analysis.title,
      summary: analysis.summary,
      content_category: analysis.contentType,
      searchable_text: analysis.searchableText,
      ai_analysis: analysis as unknown as Json,
      ...extra,
    })
    .eq("id", itemId);

  await upsertTags(userId, itemId, analysis.tags);
}

async function upsertTags(userId: string, itemId: string, tagNames: string[]) {
  if (!tagNames.length) return;
  const supabase = createServiceClient();

  for (const rawName of tagNames.slice(0, 12)) {
    const name = rawName.trim();
    if (!name) continue;
    const normalized = name.toLowerCase().replace(/\s+/g, "-");

    const { data: existing } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", userId)
      .eq("normalized_name", normalized)
      .maybeSingle();

    const tagId = existing?.id ?? (await supabase.from("tags").insert({ user_id: userId, name, normalized_name: normalized }).select("id").single()).data?.id;

    if (tagId) {
      await supabase.from("item_tags").upsert({ item_id: itemId, tag_id: tagId });
    }
  }
}

async function saveEmbeddings(itemId: string, userId: string, chunks: { content: string; pageNumber?: number }[]) {
  if (!chunks.length) return;
  const supabase = createServiceClient();
  await supabase.from("item_embeddings").delete().eq("item_id", itemId);

  const vectors = await generateEmbeddings(chunks.map((c) => c.content));
  const rows = chunks.map((chunk, i) => ({
    item_id: itemId,
    user_id: userId,
    content: chunk.content,
    embedding: (vectors[i] ?? null) as unknown as string | null,
    chunk_index: i,
    page_number: chunk.pageNumber ?? null,
  }));
  const { error } = await supabase.from("item_embeddings").insert(rows);
  if (error) console.error("[processing] failed to save embeddings", error);
}

async function withFailureHandling(itemId: string, fn: () => Promise<void>) {
  try {
    await setStatus(itemId, "processing");
    await fn();
    await setStatus(itemId, "completed");
  } catch (error) {
    const attempts = await incrementAttempts(itemId);
    const message = error instanceof Error ? error.message : "Unknown processing error";
    console.error(`[processing] item ${itemId} failed (attempt ${attempts})`, error);
    await setStatus(itemId, attempts >= MAX_ATTEMPTS ? "failed" : "failed", message);
  }
}

export async function processNoteItem(itemId: string, userId: string, title: string, content: string) {
  await withFailureHandling(itemId, async () => {
    const { analysis } = await analyzeItem({ itemType: "note", title, text: content });
    await applyAnalysis(itemId, userId, analysis, { raw_text: content });
    await saveEmbeddings(itemId, userId, [{ content: `${analysis.title}\n${content}` }]);
  });
}

export async function processLinkItem(itemId: string, userId: string, url: string) {
  await withFailureHandling(itemId, async () => {
    const metadata = await extractLinkMetadata(url);
    const guessedCategory = guessLinkCategory(url, metadata);
    const supabase = createServiceClient();

    await supabase
      .from("items")
      .update({
        source_domain: metadata.domain,
        title: metadata.title ?? url,
        thumbnail_path: null, // link previews are hotlinked signed-through on render, not stored
      })
      .eq("id", itemId);

    const { analysis } = await analyzeItem({
      itemType: "link",
      title: metadata.title ?? undefined,
      url,
      text: [metadata.description, metadata.articleText].filter(Boolean).join("\n\n") || `A ${guessedCategory} page with no extractable text.`,
    });

    await applyAnalysis(itemId, userId, analysis, {
      raw_text: metadata.articleText || null,
      processing_status: metadata.articleText ? "completed" : "needs_review",
    });
    await saveEmbeddings(itemId, userId, [{ content: `${analysis.title}\n${analysis.summary}\n${metadata.articleText.slice(0, 3000)}` }]);
  });
}

export async function processImageItem(itemId: string, userId: string, imageBase64: string, mimeType: string) {
  await withFailureHandling(itemId, async () => {
    const { analysis } = await analyzeItem({
      itemType: "image",
      images: [{ base64: imageBase64, mediaType: mimeType }],
    });
    await applyAnalysis(itemId, userId, analysis);
    await saveEmbeddings(itemId, userId, [{ content: `${analysis.title}\n${analysis.summary}\n${analysis.searchableText}` }]);
  });
}

export async function processPdfItem(itemId: string, userId: string, buffer: Buffer, maxPages: number) {
  await withFailureHandling(itemId, async () => {
    const extraction = await extractPdfText(buffer, maxPages);
    const supabase = createServiceClient();

    if (extraction.isLikelyScanned) {
      await supabase.from("items").update({ processing_status: "needs_review", raw_text: extraction.text }).eq("id", itemId);
      const { analysis } = await analyzeItem({ itemType: "pdf", text: "Scanned PDF with little extractable text. Title based on filename only." });
      await applyAnalysis(itemId, userId, analysis);
      return;
    }

    const { analysis } = await analyzeItem({ itemType: "pdf", text: extraction.text.slice(0, 12000) });
    await applyAnalysis(itemId, userId, analysis, { raw_text: extraction.text });

    const chunks = extraction.pages.flatMap((page) =>
      chunkText(page.text).map((content) => ({ content, pageNumber: page.pageNumber }))
    );
    await saveEmbeddings(itemId, userId, chunks.length ? chunks : [{ content: analysis.searchableText }]);
  });
}

export async function processReceiptItem(itemId: string, userId: string, params: { text?: string; imageBase64?: string; mimeType?: string }) {
  await withFailureHandling(itemId, async () => {
    const { extraction } = await extractReceipt({
      text: params.text,
      images: params.imageBase64 && params.mimeType ? [{ base64: params.imageBase64, mediaType: params.mimeType }] : undefined,
    });

    const { analysis } = await analyzeItem({
      itemType: "receipt",
      text: [extraction.merchant, extraction.total ? `Total: ${extraction.total} ${extraction.currency}` : null, params.text]
        .filter(Boolean)
        .join("\n"),
    });
    await applyAnalysis(itemId, userId, analysis);

    const supabase = createServiceClient();
    const { data: receiptRow, error } = await supabase
      .from("receipts")
      .upsert(
        {
          item_id: itemId,
          user_id: userId,
          merchant: extraction.merchant,
          purchase_date: extraction.purchaseDate,
          subtotal: extraction.subtotal,
          tax: extraction.tax,
          total: extraction.total,
          currency: extraction.currency,
          order_number: extraction.orderNumber,
          payment_method: extraction.paymentMethod,
          store_category: extraction.storeCategory,
          return_deadline: extraction.returnDeadline,
          return_deadline_source: extraction.returnDeadline ? "extracted" : "none",
          return_status: extraction.returnDeadline ? "open" : "not_applicable",
          warranty_end: extraction.warrantyEnd,
          extraction_confidence: extraction.confidence,
        },
        { onConflict: "item_id" }
      )
      .select("id")
      .single();

    if (error) throw new Error(`Failed to save receipt: ${error.message}`);

    if (receiptRow && extraction.lineItems.length) {
      await supabase.from("receipt_line_items").insert(
        extraction.lineItems.map((li) => ({
          receipt_id: receiptRow.id,
          name: li.name,
          quantity: li.quantity,
          unit_price: li.unitPrice,
          total_price: li.totalPrice,
        }))
      );
    }

    if (extraction.confidence < 0.5) {
      await supabase.from("items").update({ processing_status: "needs_review" }).eq("id", itemId);
    }

    await saveEmbeddings(itemId, userId, [
      { content: `Receipt from ${extraction.merchant ?? "unknown merchant"}, total ${extraction.total ?? "?"} ${extraction.currency}. ${analysis.searchableText}` },
    ]);
  });
}

/** Re-runs processing for an item stuck in "failed" or "needs_review". Caller must have already verified ownership. */
export async function retryItemProcessing(itemId: string) {
  const supabase = createServiceClient();
  const { data: item, error } = await supabase.from("items").select("*").eq("id", itemId).single();
  if (error || !item) throw new Error("Item not found");

  switch (item.item_type) {
    case "note":
      return processNoteItem(itemId, item.user_id, item.title, item.raw_text ?? "");
    case "link":
      if (item.source_url) return processLinkItem(itemId, item.user_id, item.source_url);
      break;
    default:
      // image/pdf/receipt retries require re-reading the original file from
      // storage; the retry server action handles that (see app actions).
      throw new Error("This item type must be retried from its detail page.");
  }
}
