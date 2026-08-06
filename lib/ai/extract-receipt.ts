import "server-only";
import { generateStructured } from "@/lib/ai/json-utils";
import { receiptExtractionSchema, FALLBACK_RECEIPT, type ReceiptExtraction } from "@/lib/ai/schemas";

const SYSTEM_PROMPT = `You extract structured purchase data from receipt images or PDFs for Vault, \
a personal memory app. Only report values that are actually printed on the receipt. Use null for \
anything not present or illegible — never guess a number. Dates must be ISO 8601 (YYYY-MM-DD). \
If a return policy or return-by date is printed, extract it as returnDeadline. This data will be \
shown to the user labeled "AI extracted — please verify," so accuracy matters more than completeness.`;

export async function extractReceipt(input: {
  text?: string;
  images?: { base64: string; mediaType: string }[];
}): Promise<{ extraction: ReceiptExtraction; usedFallback: boolean }> {
  const schemaDescription = `Return a JSON object matching this exact shape:
{
  "merchant": string | null,
  "purchaseDate": string | null,
  "subtotal": number | null,
  "tax": number | null,
  "total": number | null,
  "currency": string (3-letter code, default "USD"),
  "orderNumber": string | null,
  "paymentMethod": string | null,
  "storeCategory": string | null,
  "returnDeadline": string | null,
  "warrantyEnd": string | null,
  "lineItems": [{ "name": string, "quantity": number, "unitPrice": number | null, "totalPrice": number | null }],
  "confidence": number (0-1)
}`;

  const prompt = [schemaDescription, input.text ? `\nReceipt text:\n${input.text.slice(0, 8000)}` : "\nAnalyze the attached receipt image(s)."].join("\n");

  const { result, usedFallback } = await generateStructured({
    system: SYSTEM_PROMPT,
    prompt,
    schema: receiptExtractionSchema,
    fallback: FALLBACK_RECEIPT,
    images: input.images,
    maxTokens: 1500,
  });

  return { extraction: result, usedFallback };
}
