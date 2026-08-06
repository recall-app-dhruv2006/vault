"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/client-server";
import { createServiceClient } from "@/lib/db/client-service";
import { signUpSchema, signInSchema, resetPasswordSchema, updatePasswordSchema, friendlyAuthError } from "@/lib/validation/auth";
import { publicEnv } from "@/lib/config/env";

export type AuthActionState = { error?: string; success?: string } | null;

export async function signUpAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) return { error: friendlyAuthError(error.message) };
  return { success: "Check your email to verify your account, then sign in." };
}

export async function signInAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: friendlyAuthError(error.message) };

  redirect("/home");
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/auth/callback` },
  });
  if (error || !data.url) redirect("/sign-in?error=Could not start Google sign-in");
  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}

export async function resetPasswordAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter a valid email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/update-password`,
  });
  if (error) return { error: friendlyAuthError(error.message) };
  return { success: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePasswordAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Password is too short." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: friendlyAuthError(error.message) };

  redirect("/home");
}

/** Permanently deletes the current user's account and all associated data. Requires the service-role client because auth.admin APIs bypass RLS by design. */
export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const service = createServiceClient();
  // Cascading foreign keys handle items/collections/receipts/etc. Storage
  // objects are removed first since they aren't covered by DB cascades.
  const { data: items } = await service.from("items").select("storage_path, thumbnail_path").eq("user_id", user!.id);
  const paths = (items ?? []).flatMap((item) => [
    item.storage_path ? { bucket: "originals" as const, path: item.storage_path } : null,
    item.thumbnail_path ? { bucket: "thumbnails" as const, path: item.thumbnail_path } : null,
  ]).filter(Boolean) as { bucket: "originals" | "thumbnails"; path: string }[];

  if (paths.length) {
    const { deleteStorageObjects } = await import("@/lib/storage/files");
    await deleteStorageObjects(paths);
  }

  await service.auth.admin.deleteUser(user!.id);
  await supabase.auth.signOut();
  redirect("/");
}
