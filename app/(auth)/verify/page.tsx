import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MailCheck className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-h3">Check your email</h1>
        <p className="text-sm text-muted-foreground">We sent a verification link to finish creating your account.</p>
      </div>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
    </div>
  );
}
