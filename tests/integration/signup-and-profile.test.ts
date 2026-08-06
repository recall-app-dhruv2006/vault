import { describe, it, expect, afterAll } from "vitest";
import { hasIntegrationEnv, getTestServiceClient, createTestUser, deleteTestUser } from "./helpers";

describe.skipIf(!hasIntegrationEnv())("signup creates a profile, settings, and subscription row", () => {
  const supabase = getTestServiceClient();
  let userId: string;

  afterAll(async () => {
    if (userId) await deleteTestUser(supabase, userId);
  });

  it("provisions profile/user_settings/subscriptions via the handle_new_user trigger", async () => {
    const user = await createTestUser(supabase, "signup-test");
    userId = user.id;

    // Trigger runs synchronously on insert, but allow a brief moment under load.
    await new Promise((r) => setTimeout(r, 250));

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    expect(profile?.plan).toBe("free");
    expect(profile?.onboarding_completed).toBe(false);

    const { data: settings } = await supabase.from("user_settings").select("*").eq("user_id", userId).single();
    expect(settings?.theme).toBe("system");

    const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", userId).single();
    expect(subscription?.status).toBe("none");
  });
});
