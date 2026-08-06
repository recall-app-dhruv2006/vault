import Link from "next/link";
import {
  ShoppingBag, Plane, GraduationCap, Receipt, ChefHat, FlaskConical,
  Lightbulb, Clapperboard, Link2, ImageIcon, FileText, StickyNote,
  ScanLine, Shield, Lock, Trash2, EyeOff, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductPreview } from "@/components/marketing/product-preview";
import { brand, plans } from "@/lib/config/brand";

const PROBLEMS = [
  "14,000 photos in your camera roll",
  "Hundreds of forgotten bookmarks",
  "Receipts buried somewhere in email",
  "Links spread across five different apps",
  "A product you saved but can never find again",
  "“I know I saw it somewhere.”",
];

const STEPS = [
  { icon: Link2, title: "Save anything", description: "Paste a link, drop in a screenshot, upload a PDF, or jot a quick note. Takes seconds." },
  { icon: ScanLine, title: "Vault organizes it", description: "AI reads, categorizes, tags, and summarizes what you saved — no folders to manage." },
  { icon: FileText, title: "Ask naturally and find it", description: "Search the way you'd describe it to a friend. Vault shows you why each result matched." },
];

const USE_CASES = [
  { icon: ShoppingBag, title: "Shopping", description: "Track products, prices, and where you saw them." },
  { icon: Plane, title: "Travel", description: "Hotels, restaurants, and destinations in one place." },
  { icon: GraduationCap, title: "School", description: "Lecture slides, articles, and study screenshots." },
  { icon: Receipt, title: "Receipts", description: "Purchases and return deadlines, automatically tracked." },
  { icon: ChefHat, title: "Recipes", description: "Every recipe you've ever bookmarked, searchable by ingredient." },
  { icon: FlaskConical, title: "Research", description: "Papers, articles, and reference material for work." },
  { icon: Lightbulb, title: "Ideas", description: "Dorm ideas, gift ideas, project inspiration." },
  { icon: Clapperboard, title: "Content", description: "Videos and posts worth remembering." },
];

const CONTENT_TYPES = [
  { icon: Link2, label: "Links & articles" },
  { icon: ImageIcon, label: "Screenshots & images" },
  { icon: FileText, label: "PDFs & documents" },
  { icon: StickyNote, label: "Notes" },
  { icon: Receipt, label: "Receipts" },
];

export default function MarketingHomePage() {
  return (
    <>
      <section className="container grid gap-12 pb-20 pt-16 md:pt-24 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <h1 className="text-display">{brand.tagline}</h1>
          <p className="max-w-lg text-lg text-muted-foreground">{brand.description}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start Building Your Memory</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#how-it-works">Watch Demo</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-caption text-muted-foreground">
            {CONTENT_TYPES.map((c) => (
              <span key={c.label} className="flex items-center gap-1.5"><c.icon className="h-3.5 w-3.5" />{c.label}</span>
            ))}
          </div>
        </div>
        <ProductPreview />
      </section>

      <section className="border-y border-border bg-muted/40 py-16" id="product">
        <div className="container">
          <h2 className="text-h2 text-center">Sound familiar?</h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            {PROBLEMS.map((problem) => (
              <div key={problem} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                {problem}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20" id="how-it-works">
        <h2 className="text-h2 text-center">How it works</h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="text-label text-muted-foreground">Step {i + 1}</p>
              <p className="text-h3">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-20">
        <div className="container">
          <h2 className="text-h2 text-center">Built for how you actually save things</h2>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((useCase) => (
              <Card key={useCase.title} className="p-5">
                <useCase.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-medium">{useCase.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20" id="privacy">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-h2">Private by default</h2>
          <p className="mt-3 text-muted-foreground">Vault exists to help you find your own things — not to build a profile about you.</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {[
            { icon: Lock, text: "Your content is private by default and never shared between accounts." },
            { icon: Shield, text: "You control what gets uploaded and analyzed, item by item." },
            { icon: EyeOff, text: "Data is never sold, and AI processing only runs to power the search you asked for." },
            { icon: Trash2, text: "Delete any single item — or your entire account — at any time." },
          ].map((item) => (
            <div key={item.text} className="flex gap-3 rounded-lg border border-border bg-surface p-4">
              <item.icon className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-caption text-muted-foreground">
          Read the full <Link href="/privacy" className="underline">Privacy</Link> page for details on exactly what's stored and processed.
        </p>
      </section>

      <section className="border-t border-border bg-muted/40 py-20" id="pricing-preview">
        <div className="container">
          <h2 className="text-h2 text-center">Simple pricing</h2>
          <div className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
            <Card className="p-6">
              <p className="text-h3">{plans.free.name}</p>
              <p className="mt-1 text-3xl font-semibold">$0</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Up to {plans.free.limits.maxItems} saved items</li>
                <li>Basic AI search</li>
                <li>Images, links, notes, and PDFs</li>
                <li>{plans.free.limits.maxCollections} collections</li>
              </ul>
            </Card>
            <Card className="border-primary p-6">
              <p className="text-h3">{plans.pro.name}</p>
              <p className="mt-1 text-3xl font-semibold">${plans.pro.priceMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Unlimited saves</li>
                <li>Advanced AI search</li>
                <li>Receipt & return tracking</li>
                <li>Smart collections & export tools</li>
              </ul>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/pricing">See full pricing <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-20 text-center">
        <h2 className="text-h2">Save anything. Remember nothing. Find everything.</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">Start your private memory library — free, no credit card required.</p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/sign-up">Start Building Your Memory</Link>
        </Button>
      </section>
    </>
  );
}
