import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
      <Link href="/"><Logo /></Link>
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">{children}</div>
    </div>
  );
}
