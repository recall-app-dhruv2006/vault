import { z } from "zod";

/**
 * Strict schema for structured AI analysis output. Every AI response is
 * validated against this before it touches the database. If validation
 * fails, analyze-item.ts retries once with a repair prompt, then falls
 * back to a safe minimal result rather than throwing away the user's item.
 */
export const itemAnalysisSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(1000),
  contentType: z.enum([
    "image", "product", "receipt", "article", "recipe", "travel",
    "restaurant", "video", "document", "note", "other",
  ]),
  tags: z.array(z.string().min(1).max(40)).max(12),
  entities: z.object({
    people: z.array(z.string()).max(20),
    organizations: z.array(z.string()).max(20),
    places: z.array(z.string()).max(20),
    products: z.array(z.string()).max(20),
    brands: z.array(z.string()).max(20),
    dates: z.array(z.string()).max(20),
    prices: z.array(z.object({ amount: z.number(), currency: z.string().length(3) })).max(20),
  }),
  searchableText: z.string().max(4000),
  suggestedCollections: z.array(z.string().min(1).max(60)).max(5),
  confidence: z.number().min(0).max(1),
});

export type ItemAnalysis = z.infer<typeof itemAnalysisSchema>;

export const FALLBACK_ANALYSIS: ItemAnalysis = {
  title: "Untitled memory",
  summary: "We couldn't fully analyze this item. Your original file is still saved and you can retry processing.",
  contentType: "other",
  tags: [],
  entities: { people: [], organizations: [], places: [], products: [], brands: [], dates: [], prices: [] },
  searchableText: "",
  suggestedCollections: [],
  confidence: 0,
};

export const receiptExtractionSchema = z.object({
  merchant: z.string().nullable(),
  purchaseDate: z.string().nullable().describe("ISO 8601 date, e.g. 2026-03-14"),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  total: z.number().nullable(),
  currency: z.string().length(3).default("USD"),
  orderNumber: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  storeCategory: z.string().nullable(),
  returnDeadline: z.string().nullable().describe("ISO 8601 date if a return/exchange window is printed on the receipt"),
  warrantyEnd: z.string().nullable(),
  lineItems: z.array(z.object({
    name: z.string(),
    quantity: z.number().default(1),
    unitPrice: z.number().nullable(),
    totalPrice: z.number().nullable(),
  })).max(50),
  confidence: z.number().min(0).max(1),
});

export type ReceiptExtraction = z.infer<typeof receiptExtractionSchema>;

export const FALLBACK_RECEIPT: ReceiptExtraction = {
  merchant: null, purchaseDate: null, subtotal: null, tax: null, total: null,
  currency: "USD", orderNumber: null, paymentMethod: null, storeCategory: null,
  returnDeadline: null, warrantyEnd: null, lineItems: [], confidence: 0,
};

/** Structured intent parsed from a natural-language search query. */
export const searchIntentSchema = z.object({
  semanticQuery: z.string(),
  contentTypes: z.array(z.enum([
    "link", "image", "pdf", "note", "receipt",
  ])).default([]),
  minimumPrice: z.number().nullable().default(null),
  maximumPrice: z.number().nullable().default(null),
  merchantOrDomain: z.string().nullable().default(null),
  favoriteOnly: z.boolean().default(false),
  dateRange: z.object({
    relative: z.enum(["today", "this_week", "last_week", "this_month", "last_month", "this_year"]).nullable().default(null),
    start: z.string().nullable().default(null),
    end: z.string().nullable().default(null),
  }).default({ relative: null, start: null, end: null }),
  hasReturnDeadline: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type SearchIntent = z.infer<typeof searchIntentSchema>;
