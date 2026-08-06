"use client";
import { Suspense } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction, signInWithGoogleAction } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const [state, formAction] = useFormState(signInAction, null);
  const searchParams = useSearchParams();
  const redirectError = searchParams.get("error");

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-h3">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your memory library.</p>
      </div>
      <form action={signInWithGoogleAction}>
        <Button type="submit" variant="outline" className="w-full">Continue with Google</Button>
      </form>
      <div className="flex items-center gap-3 text-caption text-muted-foreground">
        <div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" />
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/reset-password" className="text-caption text-primary hover:underline">Forgot password?</Link>
          </div>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <FormMessage error={state?.error ?? redirectError ?? undefined} success={state?.success} />
        <SubmitButton>Sign in</SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        New to Recall? <Link href="/sign-up" className="text-primary hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
