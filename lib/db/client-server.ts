import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/config/env";
import type { Database } from "@/types/database";

/**
 * Server-side Supabase client for use in Server Components, Server
 * Actions, and Route Handlers. Runs as the authenticated user (via their
 * session cookie) and is subject to Row Level Security — this is the
 * client almost everything in the app should use.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no response to write to.
            // Safe to ignore because middleware refreshes the session.
          }
        },
      },
    }
  );
}
