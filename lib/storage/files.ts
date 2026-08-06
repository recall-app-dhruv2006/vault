import "server-only";
import sharp from "sharp";
import { createServiceClient } from "@/lib/db/client-service";
import { safeStorageFilename, storagePath } from "@/lib/security/sanitize";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export async function uploadOriginal(params: {
  userId: string;
  itemId: string;
  filename: string;
  mimeType: string;
  bytes: Buffer;
}): Promise<string> {
  const supabase = createServiceClient();
  const filename = safeStorageFilename(params.filename, params.itemId);
  const path = storagePath(params.userId, params.itemId, filename);

  const { error } = await supabase.storage.from("originals").upload(path, params.bytes, {
    contentType: params.mimeType,
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

export async function uploadThumbnail(params: {
  userId: string;
  itemId: string;
  sourceBytes: Buffer;
}): Promise<string | null> {
  try {
    const thumbnail = await sharp(params.sourceBytes)
      .resize(480, 480, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();

    const supabase = createServiceClient();
    const path = storagePath(params.userId, params.itemId, "thumb.webp");
    const { error } = await supabase.storage.from("thumbnails").upload(path, thumbnail, {
      contentType: "image/webp",
      upsert: true,
    });
    if (error) throw error;
    return path;
  } catch (error) {
    console.error("[storage] thumbnail generation failed", error);
    return null;
  }
}

/** Returns a short-lived signed URL for a private object. Never expose a permanent public URL. */
export async function getSignedUrl(bucket: "originals" | "thumbnails" | "avatars", path: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) {
    console.error("[storage] signed URL error", error);
    return null;
  }
  return data.signedUrl;
}

export async function deleteStorageObjects(paths: { bucket: "originals" | "thumbnails" | "avatars"; path: string }[]) {
  const supabase = createServiceClient();
  const byBucket = new Map<string, string[]>();
  for (const { bucket, path } of paths) {
    if (!byBucket.has(bucket)) byBucket.set(bucket, []);
    byBucket.get(bucket)!.push(path);
  }
  for (const [bucket, objectPaths] of byBucket) {
    const { error } = await supabase.storage.from(bucket).remove(objectPaths);
    if (error) console.error(`[storage] failed to delete from ${bucket}`, error);
  }
}
