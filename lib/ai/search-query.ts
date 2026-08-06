import "server-only";
import { generateStructured } from "@/lib/ai/json-utils";
import { searchIntentSchema, type SearchIntent } from "@/lib/ai/schemas";

/**
 * Converts a natural-language query into structured search intent.
 * Obvious filters (price, date range, "receipts", "favorites") are parsed
 * deterministically first — fast, free, and 100% reliable. The AI pass
 * only fills in the semantic query and anything the deterministic parser
 * didn't confidently catch, so a slow/unavailable AI call degrades to
 * "search everything semantically" rather than breaking search entirely.
 */
export async function interpretQuery(query: string): Promise<SearchIntent> {
  const deterministic = parseDeterministic(query);

  try {
    const { result } = await generateStructured({
      system: `You convert a user's natural-language search over their personal saved-content library into structured filters. Only set fields you are confident about from the query text. Leave the rest at their defaults.`,
      prompt: `Query: "${query}"\n\nReturn JSON matching:\n{
  "semanticQuery": string (the core thing being searched for, filters stripped out),
  "contentTypes": ("link"|"image"|"pdf"|"note"|"receipt")[],
  "minimumPrice": number | null,
  "maximumPrice": number | null,
  "merchantOrDomain": string | null,
  "favoriteOnly": boolean,
  "dateRange": { "relative": "today"|"this_week"|"last_week"|"this_month"|"last_month"|"this_year"|null, "start": string | null, "end": string | null },
  "hasReturnDeadline": boolean,
  "tags": string[]
}`,
      schema: searchIntentSchema,
      fallback: deterministic,
      maxTokens: 500,
    });
    return mergeIntents(deterministic, result);
  } catch {
    return deterministic;
  }
}

export function parseDeterministic(query: string): SearchIntent {
  const lower = query.toLowerCase();
  const intent: SearchIntent = searchIntentSchema.parse({ semanticQuery: query });

  const contentTypeMap: Record<string, SearchIntent["contentTypes"][number]> = {
    receipt: "receipt", receipts: "receipt",
    pdf: "pdf", pdfs: "pdf", document: "pdf", documents: "pdf",
    screenshot: "image", screenshots: "image", image: "image", images: "image", photo: "image", photos: "image",
    link: "link", links: "link", article: "link", website: "link",
    note: "note", notes: "note",
  };
  const foundTypes = new Set<SearchIntent["contentTypes"][number]>();
  for (const [word, type] of Object.entries(contentTypeMap)) {
    if (new RegExp(`\\b${word}\\b`).test(lower)) foundTypes.add(type);
  }
  intent.contentTypes = Array.from(foundTypes);

  const overMatch = lower.match(/(?:over|above|more than)\s*\$?(\d+(?:\.\d+)?)/);
  if (overMatch?.[1]) intent.minimumPrice = parseFloat(overMatch[1]);
  const underMatch = lower.match(/(?:under|below|less than)\s*\$?(\d+(?:\.\d+)?)/);
  if (underMatch?.[1]) intent.maximumPrice = parseFloat(underMatch[1]);
  const aroundMatch = lower.match(/around\s*\$?(\d+(?:\.\d+)?)/);
  if (aroundMatch?.[1]) {
    const val = parseFloat(aroundMatch[1]);
    intent.minimumPrice = val * 0.8;
    intent.maximumPrice = val * 1.2;
  }

  if (/\bfavorite/.test(lower)) intent.favoriteOnly = true;
  if (/return deadline|due for return|need(s)? to return/.test(lower)) intent.hasReturnDeadline = true;

  if (/\byesterday\b/.test(lower)) intent.dateRange.relative = "today";
  else if (/\blast week\b/.test(lower)) intent.dateRange.relative = "last_week";
  else if (/\bthis week\b/.test(lower)) intent.dateRange.relative = "this_week";
  else if (/\blast month\b/.test(lower)) intent.dateRange.relative = "last_month";
  else if (/\bthis month\b/.test(lower)) intent.dateRange.relative = "this_month";
  else if (/\bthis year\b/.test(lower)) intent.dateRange.relative = "this_year";

  const domainMatch = lower.match(/from\s+([a-z0-9-]+\.(?:com|org|net|co|io))/);
  if (domainMatch?.[1]) intent.merchantOrDomain = domainMatch[1];
  else {
    const merchantMatch = lower.match(/from\s+(amazon|target|walmart|best buy|costco|apple|nike|ikea)/);
    if (merchantMatch?.[1]) intent.merchantOrDomain = merchantMatch[1];
  }

  return intent;
}

function mergeIntents(deterministic: SearchIntent, aiParsed: SearchIntent): SearchIntent {
  return {
    semanticQuery: aiParsed.semanticQuery || deterministic.semanticQuery,
    contentTypes: deterministic.contentTypes.length ? deterministic.contentTypes : aiParsed.contentTypes,
    minimumPrice: deterministic.minimumPrice ?? aiParsed.minimumPrice,
    maximumPrice: deterministic.maximumPrice ?? aiParsed.maximumPrice,
    merchantOrDomain: deterministic.merchantOrDomain ?? aiParsed.merchantOrDomain,
    favoriteOnly: deterministic.favoriteOnly || aiParsed.favoriteOnly,
    dateRange: deterministic.dateRange.relative ? deterministic.dateRange : aiParsed.dateRange,
    hasReturnDeadline: deterministic.hasReturnDeadline || aiParsed.hasReturnDeadline,
    tags: aiParsed.tags,
  };
}
