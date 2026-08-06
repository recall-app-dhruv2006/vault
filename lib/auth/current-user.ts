import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/client-server";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Fetches the current authenticated user's profile, or redirects to sign-in. Use at the top of every protected server component/layout. */
export async function requireUser(): Promise<{ userId: string; email: string; profile: Profile }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/sign-in");

  return { userId: user.id, email: user.email ?? "", profile };
}
