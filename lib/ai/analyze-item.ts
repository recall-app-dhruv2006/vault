import "server-only";
import { generateStructured } from "@/lib/ai/json-utils";
import { itemAnalysisSchema, FALLBACK_ANALYSIS, type ItemAnalysis } from "@/lib/ai/schemas";

const SYSTEM_PROMPT = `You are the analysis engine for Vault, a private personal-memory app. \
A user has saved a piece of content and you must extract exactly the structured information \
they would need to find it again weeks or months later using natural language search. \
Be concrete and specific — favor descriptive nouns, colors, brand names, prices, and places \
over vague summaries. Never invent facts that are not present in the content. If the content \
is a product, describe it the way a shopper would describe it to a friend. If unsure about a \
field, leave it empty rather than guessing.`;

export interface AnalyzeItemInput {
  itemType: "link" | "image" | "pdf" | "note" | "receipt";
  title?: string;
  text?: string;
  url?: string;
  images?: { base64: string; mediaType: string }[];
}

export async function analyzeItem(input: AnalyzeItemInput): Promise<{ analysis: ItemAnalysis; usedFallback: boolean }> {
  const prompt = buildPrompt(input);

  const { result, usedFallback } = await generateStructured({
    system: SYSTEM_PROMPT,
    prompt,
    schema: itemAnalysisSchema,
    fallback: FALLBACK_ANALYSIS,
    images: input.images,
    maxTokens: 1500,
  });

  return { analysis: result, usedFallback };
}

function buildPrompt(input: AnalyzeItemInput): string {
  const schemaDescription = `Return a JSON object matching this exact shape:
{
  "title": string,
  "summary": string (1-3 sentences),
  "contentType": "image" | "product" | "receipt" | "article" | "recipe" | "travel" | "restaurant" | "video" | "document" | "note" | "other",
  "tags": string[] (max 12, lowercase, concise),
  "entities": {
    "people": string[], "organizations": string[], "places": string[],
    "products": string[], "brands": string[], "dates": string[],
    "prices": [{ "amount": number, "currency": "USD" }]
  },
  "searchableText": string (dense, keyword-rich description optimized for future search matching),
  "suggestedCollections": string[] (max 5 short collection name suggestions, e.g. "Miami Trip"),
  "confidence": number (0-1, your confidence in this analysis)
}`;

  const parts: string[] = [schemaDescription, `\nItem type: ${input.itemType}`];
  if (input.title) parts.push(`Existing title: ${input.title}`);
  if (input.url) parts.push(`Source URL: ${input.url}`);
  if (input.text) parts.push(`Content:\n${input.text.slice(0, 12000)}`);
  if (input.images?.length) parts.push(`\nAnalyze the attached image(s) directly — describe what is visibly shown, any legible text, products, prices, places, or brands.`);

  return parts.join("\n");
}
