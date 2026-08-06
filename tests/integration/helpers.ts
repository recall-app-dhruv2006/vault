/**
 * Shared helpers for integration tests that hit a real (test/dev) Supabase
 * project. These tests are intentionally skipped unless the environment is
 * configured — they are not meant to run against production data, and this
 * sandbox environment has no live Supabase project to test against.
 *
 * To run these for real: create a throwaway Supabase project, apply the
 * migrations in supabase/migrations, set TEST_SUPABASE_URL and
 * TEST_SUPABASE_SERVICE_ROLE_KEY, then `npm run test:integration`.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function hasIntegrationEnv(): boolean {
  return Boolean(process.env.TEST_SUPABASE_URL && process.env.TEST_SUPABASE_SERVICE_ROLE_KEY);
}

export function getTestServiceClient(): SupabaseClient<Database> {
  return createClient<Database>(process.env.TEST_SUPABASE_URL!, process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export async function createTestUser(supabase: SupabaseClient<Database>, emailPrefix: string) {
  const email = `${emailPrefix}-${Date.now()}@recall-test.local`;
  const { data, error } = await supabase.auth.admin.createUser({ email, password: "TestPassword123!", email_confirm: true });
  if (error || !data.user) throw new Error(`Failed to create test user: ${error?.message}`);
  return data.user;
}

export async function deleteTestUser(supabase: SupabaseClient<Database>, userId: string) {
  await supabase.auth.admin.deleteUser(userId);
}
