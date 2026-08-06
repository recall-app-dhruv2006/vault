import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-16 text-center">
      <h1 className="text-h1">Get in touch</h1>
      <p className="mt-3 text-muted-foreground">Questions, feedback, or a security report — we'd like to hear it.</p>
      <a href={`mailto:${brand.supportEmail}`} className="mt-8 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-medium hover:bg-muted">
        <Mail className="h-4 w-4" /> {brand.supportEmail}
      </a>
    </div>
  );
}
