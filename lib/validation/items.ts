import { z } from "zod";

export const saveNoteSchema = z.object({
  title: z.string().trim().min(1, "Give your note a title.").max(200),
  content: z.string().trim().min(1, "Write something to save.").max(20000),
  collectionId: z.string().uuid().optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  isFavorite: z.boolean().optional(),
});
export type SaveNoteInput = z.infer<typeof saveNoteSchema>;

export const saveLinkSchema = z.object({
  url: z.string().trim().url("Enter a valid URL, including https://"),
  collectionId: z.string().uuid().optional(),
});
export type SaveLinkInput = z.infer<typeof saveLinkSchema>;

export const updateItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200).optional(),
  summary: z.string().trim().max(1000).optional(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
});
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name your collection.").max(80),
  description: z.string().trim().max(300).optional(),
  icon: z.string().max(40).optional(),
});
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export const updateReceiptSchema = z.object({
  id: z.string().uuid(),
  merchant: z.string().trim().max(120).nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  tax: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  currency: z.string().length(3).optional(),
  orderNumber: z.string().trim().max(80).nullable().optional(),
  returnDeadline: z.string().nullable().optional(),
  warrantyEnd: z.string().nullable().optional(),
  returnStatus: z.enum(["open", "returned", "expired", "not_applicable"]).optional(),
});
export type UpdateReceiptInput = z.infer<typeof updateReceiptSchema>;

export const searchQuerySchema = z.object({
  query: z.string().trim().max(500),
  contentTypes: z.array(z.enum(["link", "image", "pdf", "note", "receipt"])).optional(),
  collectionId: z.string().uuid().optional(),
  favoriteOnly: z.boolean().optional(),
  minimumPrice: z.number().optional(),
  maximumPrice: z.number().optional(),
  hasReturnDeadline: z.boolean().optional(),
  sort: z.enum(["relevance", "recent", "oldest"]).optional(),
  layout: z.enum(["grid", "list"]).optional(),
  cursor: z.number().int().min(0).optional(),
});
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export const MAX_NOTE_LENGTH = 20000;
