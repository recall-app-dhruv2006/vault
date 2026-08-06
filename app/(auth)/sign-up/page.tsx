"use client";
import { useFormState } from "react-dom";
import Link from "next/link";
import { signUpAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";

export default function SignUpPage() {
  const [state, formAction] = useFormState(signUpAction, null);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-h3">Create your account</h1>
        <p className="text-sm text-muted-foreground">Your private memory library starts here.</p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Name</Label>
          <Input id="displayName" name="displayName" placeholder="Dhruv" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="At least 8 characters" required autoComplete="new-password" minLength={8} />
        </div>
        <FormMessage error={state?.error} success={state?.success} />
        <SubmitButton>Create account</SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
