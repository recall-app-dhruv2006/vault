"use client";
import { useFormState } from "react-dom";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(resetPasswordAction, null);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-h3">Reset your password</h1>
        <p className="text-sm text-muted-foreground">We'll email you a link to choose a new one.</p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <FormMessage error={state?.error} success={state?.success} />
        <SubmitButton>Send reset link</SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/sign-in" className="text-primary hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
