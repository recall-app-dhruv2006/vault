"use client";
import { useFormState } from "react-dom";
import { updatePasswordAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";

export default function UpdatePasswordPage() {
  const [state, formAction] = useFormState(updatePasswordAction, null);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-h3">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">This link is only valid for a short time.</p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" placeholder="At least 8 characters" required autoComplete="new-password" minLength={8} />
        </div>
        <FormMessage error={state?.error} success={state?.success} />
        <SubmitButton>Update password</SubmitButton>
      </form>
    </div>
  );
}
