import { describe, it, expect } from "vitest";
import { itemAnalysisSchema, receiptExtractionSchema, searchIntentSchema } from "@/lib/ai/schemas";

describe("itemAnalysisSchema", () => {
  it("accepts a well-formed analysis", () => {
    const result = itemAnalysisSchema.safeParse({
      title: "Blue Audi Wheel",
      summary: "A gloss black 20-inch wheel.",
      contentType: "product",
      tags: ["wheels", "audi"],
      entities: { people: [], organizations: [], places: [], products: ["wheel"], brands: ["Audi"], dates: [], prices: [{ amount: 289, currency: "USD" }] },
      searchableText: "gloss black audi wheel",
      suggestedCollections: ["Car Mods"],
      confidence: 0.9,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid contentType", () => {
    const result = itemAnalysisSchema.safeParse({
      title: "x", summary: "x", contentType: "not-a-type", tags: [],
      entities: { people: [], organizations: [], places: [], products: [], brands: [], dates: [], prices: [] },
      searchableText: "x", suggestedCollections: [], confidence: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects confidence outside 0-1", () => {
    const result = itemAnalysisSchema.safeParse({
      title: "x", summary: "x", contentType: "note", tags: [],
      entities: { people: [], organizations: [], places: [], products: [], brands: [], dates: [], prices: [] },
      searchableText: "x", suggestedCollections: [], confidence: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("receiptExtractionSchema", () => {
  it("allows null fields for unknown values", () => {
    const result = receiptExtractionSchema.safeParse({
      merchant: null, purchaseDate: null, subtotal: null, tax: null, total: null,
      currency: "USD", orderNumber: null, paymentMethod: null, storeCategory: null,
      returnDeadline: null, warrantyEnd: null, lineItems: [], confidence: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a currency that isn't a 3-letter code", () => {
    const result = receiptExtractionSchema.safeParse({
      merchant: "Target", purchaseDate: "2026-01-01", subtotal: 10, tax: 1, total: 11,
      currency: "US-Dollar", orderNumber: null, paymentMethod: null, storeCategory: null,
      returnDeadline: null, warrantyEnd: null, lineItems: [], confidence: 0.8,
    });
    expect(result.success).toBe(false);
  });
});

describe("searchIntentSchema", () => {
  it("applies defaults when only semanticQuery is given", () => {
    const result = searchIntentSchema.parse({ semanticQuery: "wheels" });
    expect(result.contentTypes).toEqual([]);
    expect(result.favoriteOnly).toBe(false);
    expect(result.dateRange.relative).toBeNull();
  });
});
