import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/db/client-server";
import { getItemCounts } from "@/lib/db/queries";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { userId, email, profile } = await requireUser();
  const { tab } = await searchParams;
  const supabase = await createClient();
  const [{ data: settings }, { total }] = await Promise.all([
    supabase.from("user_settings").select("*").eq("user_id", userId).single(),
    getItemCounts(userId),
  ]);

  if (!settings) return null;

  return (
    <div className="container max-w-3xl space-y-6 py-8">
      <h1 className="text-h1">Settings</h1>
      <SettingsTabs
        displayName={profile.display_name}
        email={email}
        plan={profile.plan}
        settings={settings}
        itemCount={total}
        defaultTab={tab ?? "profile"}
      />
    </div>
  );
}
