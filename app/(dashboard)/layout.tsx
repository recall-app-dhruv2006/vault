import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/db/client-server";
import { getItemCounts } from "@/lib/db/queries";
import { AddMemoryProvider } from "@/components/upload/add-memory-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, email, profile } = await requireUser();
  if (!profile.onboarding_completed) redirect("/onboarding");

  const supabase = await createClient();
  const [{ total }, { count: upcomingReturns }] = await Promise.all([
    getItemCounts(userId),
    supabase
      .from("receipts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("return_status", "open")
      .gte("return_deadline", new Date().toISOString().slice(0, 10)),
  ]);

  return (
    <AddMemoryProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar itemCount={total} plan={profile.plan} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar displayName={profile.display_name} email={email} avatarUrl={profile.avatar_url} upcomingReturnsCount={upcomingReturns ?? 0} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AddMemoryProvider>
  );
}
