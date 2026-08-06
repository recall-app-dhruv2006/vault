"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";

/** Browser-safe Supabase client. Uses the anon key + RLS for all access. */
export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
