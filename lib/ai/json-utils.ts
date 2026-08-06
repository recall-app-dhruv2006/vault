import "server-only";
import { z } from "zod";
import { getTextProvider } from "@/lib/ai/provider";

/**
 * Calls the text provider expecting a JSON object back, validates against
 * `schema`, and retries once with a repair prompt if parsing/validation
 * fails. Never throws for a malformed model response — callers pass a
 * `fallback` value that is returned instead so a single flaky AI call
 * never loses a user's saved item.
 */
export async function generateStructured<T>(params: {
  system: string;
  prompt: string;
  // Only the Output type param is constrained; Input is left as `any` so
  // inference locks onto the post-`.default()` Output shape rather than
  // the (partially optional) pre-default Input shape.
  schema: z.ZodType<T, z.ZodTypeDef, any>;
  fallback: T;
  images?: { base64: string; mediaType: string }[];
  maxTokens?: number;
}): Promise<{ result: T; usedFallback: boolean }> {
  const provider = getTextProvider();
  const jsonInstruction =
    "\n\nRespond with ONLY a single valid JSON object. No markdown code fences, no commentary before or after.";

  try {
    const raw = await provider.generateJSON({
      system: params.system + jsonInstruction,
      prompt: params.prompt,
      images: params.images,
      maxTokens: params.maxTokens,
    });
    const parsed = params.schema.safeParse(extractJson(raw));
    if (parsed.success) return { result: parsed.data, usedFallback: false };

    // Repair attempt: show the model its own broken output and the validation error.
    const repaired = await provider.generateJSON({
      system: params.system + jsonInstruction,
      prompt: `Your previous response failed schema validation.\n\nPrevious response:\n${raw}\n\nValidation errors:\n${parsed.error.message}\n\nOriginal request:\n${params.prompt}\n\nReturn a corrected JSON object only.`,
      images: params.images,
      maxTokens: params.maxTokens,
    });
    const reparsed = params.schema.safeParse(extractJson(repaired));
    if (reparsed.success) return { result: reparsed.data, usedFallback: false };

    return { result: params.fallback, usedFallback: true };
  } catch (error) {
    console.error("[ai] generateStructured failed", error);
    return { result: params.fallback, usedFallback: true };
  }
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  try {
    return JSON.parse(candidate ?? trimmed);
  } catch {
    // Last resort: grab the widest {...} span in the text.
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
