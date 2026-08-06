import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getServerEnv } from "@/lib/config/env";

/**
 * Provider-agnostic AI interface. Every AI-touching module in lib/ai
 * depends on this interface, not on Anthropic directly, so the underlying
 * model provider can be swapped (or A/B tested) by writing a new class
 * that implements TextGenerationProvider / VisionProvider / EmbeddingProvider
 * and changing getTextProvider()/getEmbeddingProvider() below.
 */

export interface TextGenerationProvider {
  /** Generate a structured JSON response for a given prompt. Caller validates with Zod. */
  generateJSON(params: {
    system: string;
    prompt: string;
    maxTokens?: number;
    images?: { base64: string; mediaType: string }[];
  }): Promise<string>;
}

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
  readonly dimensions: number;
}

class AnthropicTextProvider implements TextGenerationProvider {
  private client: Anthropic;
  private model = "claude-sonnet-4-5";

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateJSON(params: {
    system: string;
    prompt: string;
    maxTokens?: number;
    images?: { base64: string; mediaType: string }[];
  }): Promise<string> {
    const content: Anthropic.MessageParam["content"] = [];

    if (params.images) {
      for (const image of params.images) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: image.mediaType as "image/jpeg" | "image/png" | "image/webp", data: image.base64 },
        });
      }
    }
    content.push({ type: "text", text: params.prompt });

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: params.maxTokens ?? 1500,
      system: params.system,
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AI provider returned no text content");
    }
    return textBlock.text;
  }
}

/**
 * Voyage AI embedding provider (Anthropic's recommended embedding partner).
 * Swap this class (and EMBEDDING_PROVIDER env var) to use OpenAI, Cohere,
 * or any other embedding API — the rest of the app only calls .embed().
 */
class VoyageEmbeddingProvider implements EmbeddingProvider {
  dimensions = 1024;
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: texts, model: this.model, output_dimension: this.dimensions }),
    });

    if (!response.ok) {
      throw new Error(`Embedding provider error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as { data: { embedding: number[] }[] };
    return data.data.map((d) => d.embedding);
  }
}

/** Deterministic local fallback so search still works without an embedding key configured (dev only). */
class HashEmbeddingProvider implements EmbeddingProvider {
  dimensions = 1024;
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => {
      const vec = new Array(this.dimensions).fill(0);
      for (let i = 0; i < text.length; i++) {
        vec[(text.charCodeAt(i) * (i + 1)) % this.dimensions] += 1;
      }
      const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
      return vec.map((v) => v / norm);
    });
  }
}

let textProvider: TextGenerationProvider | null = null;
let embeddingProvider: EmbeddingProvider | null = null;

export function getTextProvider(): TextGenerationProvider {
  if (!textProvider) {
    const env = getServerEnv();
    textProvider = new AnthropicTextProvider(env.ANTHROPIC_API_KEY);
  }
  return textProvider;
}

export function getEmbeddingProvider(): EmbeddingProvider {
  if (!embeddingProvider) {
    const env = getServerEnv();
    embeddingProvider =
      env.EMBEDDING_API_KEY && env.EMBEDDING_PROVIDER === "voyage"
        ? new VoyageEmbeddingProvider(env.EMBEDDING_API_KEY, env.EMBEDDING_MODEL)
        : new HashEmbeddingProvider();
  }
  return embeddingProvider;
}
