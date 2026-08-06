import "server-only";

/** Strips all HTML tags/scripts from extracted page text. We never render raw untrusted HTML. */
export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Produces a safe, unique storage filename. Never trusts the user-supplied original filename. */
export function safeStorageFilename(originalFilename: string, itemId: string): string {
  const dotIndex = originalFilename.lastIndexOf(".");
  const rawExt = dotIndex > -1 && dotIndex < originalFilename.length - 1 ? originalFilename.slice(dotIndex + 1) : "";
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  return `${itemId}.${ext || "bin"}`;
}

export function storagePath(userId: string, itemId: string, filename: string): string {
  // Path traversal is structurally impossible: every segment is a UUID or
  // a filename we generated ourselves, never user-controlled text.
  return `${userId}/${itemId}/${filename}`;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf",
]);

export function isAllowedMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.has(mime);
}

export function assertFileConstraints(file: { size: number; type: string }, maxBytes: number) {
  if (!isAllowedMimeType(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Vault accepts JPEG, PNG, WebP, HEIC, and PDF files.`);
  }
  if (file.size > maxBytes) {
    throw new Error(`File is too large. Maximum size is ${(maxBytes / 1_000_000).toFixed(0)}MB on your current plan.`);
  }
}
