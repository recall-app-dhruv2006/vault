import { describe, it, expect } from "vitest";
import { saveNoteSchema, saveLinkSchema, createCollectionSchema, updateReceiptSchema } from "@/lib/validation/items";
import { signUpSchema, signInSchema } from "@/lib/validation/auth";

describe("saveNoteSchema", () => {
  it("requires non-empty title and content", () => {
    expect(saveNoteSchema.safeParse({ title: "", content: "" }).success).toBe(false);
    expect(saveNoteSchema.safeParse({ title: "Groceries", content: "Milk, eggs" }).success).toBe(true);
  });
});

describe("saveLinkSchema", () => {
  it("rejects a non-URL string", () => {
    expect(saveLinkSchema.safeParse({ url: "not a url" }).success).toBe(false);
  });
  it("accepts a valid https URL", () => {
    expect(saveLinkSchema.safeParse({ url: "https://example.com/product" }).success).toBe(true);
  });
});

describe("createCollectionSchema", () => {
  it("requires a name under 80 characters", () => {
    expect(createCollectionSchema.safeParse({ name: "" }).success).toBe(false);
    expect(createCollectionSchema.safeParse({ name: "a".repeat(81) }).success).toBe(false);
    expect(createCollectionSchema.safeParse({ name: "Miami Trip" }).success).toBe(true);
  });
});

describe("updateReceiptSchema", () => {
  it("requires a valid id and allows partial updates", () => {
    expect(updateReceiptSchema.safeParse({ id: "not-a-uuid" }).success).toBe(false);
    expect(updateReceiptSchema.safeParse({ id: "11111111-1111-1111-1111-111111111111", total: 42.5 }).success).toBe(true);
  });
});

describe("signUpSchema", () => {
  it("requires an 8+ character password", () => {
    expect(signUpSchema.safeParse({ email: "a@b.com", password: "short", displayName: "A" }).success).toBe(false);
    expect(signUpSchema.safeParse({ email: "a@b.com", password: "longenough", displayName: "A" }).success).toBe(true);
  });
});

describe("signInSchema", () => {
  it("requires a valid email", () => {
    expect(signInSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });
});
