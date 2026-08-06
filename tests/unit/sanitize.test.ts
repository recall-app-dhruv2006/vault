import { describe, it, expect } from "vitest";
import { safeStorageFilename, storagePath, isAllowedMimeType, assertFileConstraints, stripHtml } from "@/lib/security/sanitize";

describe("safeStorageFilename", () => {
  it("ignores the user-supplied name and keys off the item id", () => {
    const filename = safeStorageFilename("../../etc/passwd.jpg", "item-123");
    expect(filename).toBe("item-123.jpg");
  });

  it("falls back to .bin for an unrecognized/missing extension", () => {
    expect(safeStorageFilename("no-extension", "item-1")).toBe("item-1.bin");
  });
});

describe("storagePath", () => {
  it("builds a {user}/{item}/{filename} path", () => {
    expect(storagePath("user-1", "item-1", "thumb.webp")).toBe("user-1/item-1/thumb.webp");
  });
});

describe("isAllowedMimeType", () => {
  it("allows images and PDFs", () => {
    expect(isAllowedMimeType("image/jpeg")).toBe(true);
    expect(isAllowedMimeType("application/pdf")).toBe(true);
  });
  it("rejects unsupported types", () => {
    expect(isAllowedMimeType("application/x-msdownload")).toBe(false);
  });
});

describe("assertFileConstraints", () => {
  it("throws for a disallowed mime type", () => {
    expect(() => assertFileConstraints({ size: 100, type: "text/html" }, 1_000_000)).toThrow();
  });
  it("throws when over the size limit", () => {
    expect(() => assertFileConstraints({ size: 2_000_000, type: "image/png" }, 1_000_000)).toThrow();
  });
  it("passes for a valid small image", () => {
    expect(() => assertFileConstraints({ size: 100, type: "image/png" }, 1_000_000)).not.toThrow();
  });
});

describe("stripHtml", () => {
  it("removes script tags entirely", () => {
    const result = stripHtml("<p>Hello</p><script>alert(1)</script>");
    expect(result).not.toContain("alert");
    expect(result).toContain("Hello");
  });
});
