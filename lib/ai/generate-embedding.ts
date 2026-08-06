import "server-only";
import { getEmbeddingProvider } from "@/lib/ai/provider";

/** Splits long text into overlapping chunks so PDFs/long articles embed with useful granularity. */
export function chunkText(text: string, chunkSize = 1200, overlap = 150): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= chunkSize) return clean.length ? [clean] : [];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - overlap;
  }
  return chunks;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const provider = getEmbeddingProvider();
  // Batch in groups of 32 to stay within provider request limits.
  const batches: number[][][] = [];
  const BATCH = 32;
  for (let i = 0; i < texts.length; i += BATCH) {
    batches.push(await provider.embed(texts.slice(i, i + BATCH)));
  }
  return batches.flat();
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const [vector] = await generateEmbeddings([text]);
  return vector ?? [];
}
