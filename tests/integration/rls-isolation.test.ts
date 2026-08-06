import { describe, it, expect, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { hasIntegrationEnv, getTestServiceClient, createTestUser, deleteTestUser } from "./helpers";
import type { Database } from "@/types/database";

/**
 * The single most important test in this suite: proves that RLS actually
 * stops one user from reading another user's items via the anon-key client
 * (i.e. the way the real app queries data), not just via the service role.
 */
describe.skipIf(!hasIntegrationEnv())("Row Level Security isolates user data", () => {
  const service = getTestServiceClient();
  let userAId: string;
  let userBId: string;
  let itemId: string;

  afterAll(async () => {
    if (userAId) await deleteTestUser(service, userAId);
    if (userBId) await deleteTestUser(service, userBId);
  });

  it("user B cannot read an item created by user A", async () => {
    const userA = await createTestUser(service, "rls-user-a");
    const userB = await createTestUser(service, "rls-user-b");
    userAId = userA.id;
    userBId = userB.id;

    const { data: item, error } = await service
      .from("items")
      .insert({ user_id: userAId, item_type: "note", title: "User A's private note", raw_text: "secret", processing_status: "completed" })
      .select("id")
      .single();
    expect(error).toBeNull();
    itemId = item!.id;

    // Sign in as user B with the anon key and RLS enforced (not the service role).
    const anonClient = createClient<Database>(process.env.TEST_SUPABASE_URL!, process.env.TEST_SUPABASE_ANON_KEY!);
    const { error: signInError } = await anonClient.auth.signInWithPassword({ email: userB.email!, password: "TestPassword123!" });
    expect(signInError).toBeNull();

    const { data: crossUserRead, error: readError } = await anonClient.from("items").select("*").eq("id", itemId);
    expect(readError).toBeNull();
    expect(crossUserRead).toEqual([]); // RLS silently filters, it doesn't error
  });
});
