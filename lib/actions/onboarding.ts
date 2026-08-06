"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/client-server";
import { requireUser } from "@/lib/auth/current-user";

export async function savePreferencesAction(preferences: string[]) {
  const { userId } = await requireUser();
  const supabase = await createClient();
  await supabase.from("profiles").update({ save_preferences: preferences, onboarding_step: "first_save" }).eq("id", userId);
}

export async function setOnboardingStepAction(step: string) {
  const { userId } = await requireUser();
  const supabase = await createClient();
  await supabase.from("profiles").update({ onboarding_step: step }).eq("id", userId);
}

export async function completeOnboardingAction() {
  const { userId } = await requireUser();
  const supabase = await createClient();
  await supabase.from("profiles").update({ onboarding_completed: true, onboarding_step: "done" }).eq("id", userId);
  redirect("/home");
}
