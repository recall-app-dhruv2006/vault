import { z } from "zod";

/**
 * Validates environment variables at startup so misconfiguration fails
 * fast and loudly instead of surfacing as a confusing runtime error deep
 * in a request handler.
 *
 * IMPORTANT: only NEXT_PUBLIC_* variables are safe to read in browser code.
 * Everything else in `serverEnv` must never be imported from a "use client"
 * file — importing lib/config/env.ts server-side keys into client code is
 * a build-time mistake, not just a runtime one, so keep server-only reads
 * inside server components, server actions, and route handlers.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required for AI analysis"),
  EMBEDDING_API_KEY: z.string().optional(),
  EMBEDDING_PROVIDER: z.string().default("voyage"),
  EMBEDDING_MODEL: z.string().default("voyage-3-lite"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RATE_LIMIT_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
});

function parsePublic() {
  const result = publicSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });
  if (!result.success) {
    // In dev/build without Supabase configured yet, fall back to placeholders
    // so the marketing site and local `next build` still succeed. Any route
    // that actually needs Supabase will fail loudly at request time instead.
    if (process.env.NODE_ENV !== "production" || process.env.SKIP_ENV_VALIDATION === "true") {
      return {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      };
    }
    throw new Error(`Invalid public environment variables: ${result.error.message}`);
  }
  return result.data;
}

function parseServer() {
  const result = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    EMBEDDING_API_KEY: process.env.EMBEDDING_API_KEY,
    EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER,
    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED,
  });
  if (!result.success) {
    if (process.env.NODE_ENV !== "production" || process.env.SKIP_ENV_VALIDATION === "true") {
      return {
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-role-key",
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "placeholder-anthropic-key",
        EMBEDDING_API_KEY: process.env.EMBEDDING_API_KEY,
        EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER ?? "voyage",
        EMBEDDING_MODEL: process.env.EMBEDDING_MODEL ?? "voyage-3-lite",
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== "false",
      };
    }
    throw new Error(`Invalid server environment variables: ${result.error.message}`);
  }
  return result.data;
}

export const publicEnv = parsePublic();

/** Only import this from server-only code (server actions, route handlers, RSC). */
export function getServerEnv() {
  return parseServer();
}
