import "server-only";
import { createServiceClient } from "@/lib/db/client-service";
import { getServerEnv } from "@/lib/config/env";

/**
 * Simple sliding-window rate limiter backed by the analytics_events table
 * (no external Redis dependency needed for the MVP). Good enough to blunt
 * abuse of AI/search endpoints; swap for Upstash Redis at real scale.
 */
export async function checkRateLimit(params: {
  userId: string;
  action: string;
  limit: number;
  windowMs: number;
}): Promise<{ allowed: boolean; remaining: number }> {
  const env = getServerEnv();
  if (!env.RATE_LIMIT_ENABLED) return { allowed: true, remaining: params.limit };

  const supabase = createServiceClient();
  const windowStart = new Date(Date.now() - params.windowMs).toISOString();

  const { count } = await supabase
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", params.userId)
    .eq("event_name", `rate_limit:${params.action}`)
    .gte("created_at", windowStart);

  const used = count ?? 0;
  if (used >= params.limit) {
    return { allowed: false, remaining: 0 };
  }

  await supabase.from("analytics_events").insert({
    user_id: params.userId,
    event_name: `rate_limit:${params.action}`,
    metadata: {},
  });

  return { allowed: true, remaining: params.limit - used - 1 };
}
