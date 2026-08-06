import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  displayName: z.string().trim().min(1, "Tell us what to call you.").max(60),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

/** Maps raw Supabase Auth error messages to calm, user-readable copy. */
export function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "That email or password doesn't match our records.";
  if (lower.includes("user already registered")) return "An account with this email already exists. Try signing in instead.";
  if (lower.includes("email not confirmed")) return "Please verify your email before signing in — check your inbox for the link.";
  if (lower.includes("token has expired") || lower.includes("invalid or has expired")) return "This link has expired. Request a new one below.";
  if (lower.includes("rate limit")) return "Too many attempts. Please wait a few minutes and try again.";
  if (lower.includes("network") || lower.includes("fetch")) return "We couldn't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}
