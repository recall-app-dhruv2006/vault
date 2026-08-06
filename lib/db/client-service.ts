import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/config/env";
import { getServerEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client. BYPASSES Row Level Security entirely.
 *
 * Use ONLY for:
 *  - Background processing jobs (AI analysis, embeddings) that must write
 *    results on behalf of a user without an active session
 *  - Admin-safe demo seeding
 *  - Signed URL generation for private storage objects
 *
 * NEVER import this into a client component, NEVER return this client (or
 * its key) to the browser, and always manually scope queries with
 * `.eq("user_id", userId)` since RLS is not enforced here.
 */
export function createServiceClient() {
  const serverEnv = getServerEnv();
  return createSupabaseClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
