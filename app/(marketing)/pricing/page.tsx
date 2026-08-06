import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { plans } from "@/lib/config/brand";

export const metadata: Metadata = { title: "Pricing" };

const FREE_FEATURES = [
  `Up to ${plans.free.limits.maxItems} saved items`,
  "Basic AI natural-language search",
  "Images, links, notes, and PDFs",
  `${plans.free.limits.maxCollections} collections`,
  "Receipt scanning with return reminders",
  `${plans.free.limits.maxFileSizeMb}MB max file size`,
];

const PRO_FEATURES = [
  "Unlimited saved items",
  "Advanced AI search with higher daily limits",
  "Receipt & return tracking with reminders",
  "Smart collections (auto-updating, saved-filter folders)",
  "Faster, priority processing",
  "Data export tools",
  `${plans.pro.limits.maxFileSizeMb}MB max file size`,
];

export default function PricingPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-h1">Simple, honest pricing</h1>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade only if your library outgrows it.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        <Card className="flex flex-col p-8">
          <p className="text-h3">{plans.free.name}</p>
          <p className="mt-2 text-4xl font-semibold">$0</p>
          <p className="text-sm text-muted-foreground">forever</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-success" />{f}</li>
            ))}
          </ul>
          <Button variant="outline" className="mt-8" asChild>
            <Link href="/sign-up">Start Free</Link>
          </Button>
        </Card>

        <Card className="flex flex-col border-primary p-8">
          <p className="text-h3">{plans.pro.name}</p>
          <p className="mt-2 text-4xl font-semibold">${plans.pro.priceMonthly}<span className="text-base font-normal text-muted-foreground">/month</span></p>
          <p className="text-sm text-muted-foreground">billed monthly</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-success" />{f}</li>
            ))}
          </ul>
          <Button className="mt-8" asChild>
            <Link href="/sign-up">Start Free, Upgrade Later</Link>
          </Button>
          <p className="mt-2 text-center text-caption text-muted-foreground">Billing isn't live yet — Pro upgrades are coming soon.</p>
        </Card>
      </div>

      <p className="mx-auto mt-12 max-w-xl text-center text-caption text-muted-foreground">
        Prices shown are illustrative for this MVP and subject to change before a public launch.
      </p>
    </div>
  );
}
