import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, FolderOpen, Clock3, Receipt as ReceiptIcon, Eye } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getRecentItems, getItemCountsByType } from "@/lib/db/queries";
import { getMemoryInsights, buildSuggestedQueries } from "@/lib/db/insights";
import { HeroSearch } from "@/components/home/hero-search";
import { QuickAddBar } from "@/components/home/quick-add-bar";
import { ItemCard } from "@/components/items/item-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const { userId, profile } = await requireUser();
  const [recentItems, typeCounts, insights] = await Promise.all([
    getRecentItems(userId, 8),
    getItemCountsByType(userId),
    getMemoryInsights(userId),
  ]);
  const suggestedQueries = buildSuggestedQueries(insights, typeCounts);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile.display_name?.split(" ")[0] ?? "there";

  return (
    <div className="container max-w-5xl space-y-10 py-8">
      <div className="space-y-1">
        <h1 className="text-h1">{greeting}, {firstName}.</h1>
        <p className="text-muted-foreground">What are you trying to remember?</p>
      </div>

      <HeroSearch />
      <QuickAddBar />

      {suggestedQueries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((q) => (
            <Link key={q} href={`/search?q=${encodeURIComponent(q)}`} className="rounded-full border border-border px-3 py-1.5 text-caption text-muted-foreground hover:border-primary/40 hover:text-foreground">
              {q}
            </Link>
          ))}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <InsightCard icon={Sparkles} label="Saved this week" value={insights.savedThisWeek} />
        <InsightCard icon={FolderOpen} label="Most common type" value={insights.mostCommonCategory ?? "—"} capitalize />
        <InsightCard icon={Clock3} label="Unorganized items" value={insights.unorganizedCount} />
        <InsightCard icon={ReceiptIcon} label="Return deadlines" value={insights.upcomingReturnDeadlines} href="/receipts?filter=upcoming" />
        <InsightCard icon={Eye} label="Revisited today" value={insights.recentlyRevisited} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h3">Recent memories</h2>
          <Link href="/items" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {recentItems.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nothing saved yet"
            description="Save your first screenshot, link, note, or PDF and Vault will start organizing it for you."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recentItems.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function InsightCard({ icon: Icon, label, value, href, capitalize }: { icon: React.ElementType; label: string; value: string | number; href?: string; capitalize?: boolean }) {
  const content = (
    <Card className="p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className={`mt-2 text-xl font-semibold ${capitalize ? "capitalize" : ""}`}>{value}</p>
      <p className="text-caption text-muted-foreground">{label}</p>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
