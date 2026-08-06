import type { Metadata } from "next";
import { Receipt as ReceiptIcon } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getAllReceipts, getUpcomingReturns, getPastReturns, getMonthlySpending } from "@/lib/db/receipts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ReceiptRow } from "@/components/receipts/receipt-row";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Receipts" };

export default async function ReceiptsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { userId } = await requireUser();
  const { filter } = await searchParams;
  const [all, upcoming, past, monthly] = await Promise.all([
    getAllReceipts(userId),
    getUpcomingReturns(userId),
    getPastReturns(userId),
    getMonthlySpending(userId),
  ]);

  const merchants = Array.from(new Set(all.map((r) => r.merchant).filter(Boolean))) as string[];

  return (
    <div className="container max-w-4xl space-y-6 py-8">
      <div>
        <h1 className="text-h1">Receipts</h1>
        <p className="text-muted-foreground">Purchases and return deadlines, automatically tracked — not a full financial tool.</p>
      </div>

      <Tabs defaultValue={filter === "upcoming" ? "upcoming" : "all"}>
        <TabsList>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past deadlines ({past.length})</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {all.length === 0 ? (
            <EmptyState icon={ReceiptIcon} title="No receipts yet" description="Scan a receipt and Vault will extract the merchant, total, and any return deadline for you." />
          ) : (
            <div className="space-y-2">{all.map((r) => <ReceiptRow key={r.id} receipt={r} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <EmptyState icon={ReceiptIcon} title="No upcoming return deadlines" description="When a saved receipt has a return window, it'll show up here before it expires." />
          ) : (
            <div className="space-y-2">{upcoming.map((r) => <ReceiptRow key={r.id} receipt={r} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {past.length === 0 ? (
            <EmptyState icon={ReceiptIcon} title="No past deadlines" description="Expired return windows will appear here for reference." />
          ) : (
            <div className="space-y-2">{past.map((r) => <ReceiptRow key={r.id} receipt={r} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="merchants">
          {merchants.length === 0 ? (
            <EmptyState icon={ReceiptIcon} title="No merchants yet" description="Merchants from your saved receipts will be listed here." />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {merchants.map((m) => {
                const count = all.filter((r) => r.merchant === m).length;
                return (
                  <Card key={m} className="flex items-center justify-between p-4">
                    <span className="text-sm font-medium">{m}</span>
                    <span className="text-caption text-muted-foreground">{count} receipt{count === 1 ? "" : "s"}</span>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="spending">
          {monthly.length === 0 ? (
            <EmptyState icon={ReceiptIcon} title="Nothing to show yet" description="Monthly totals will appear once you've saved a few receipts." />
          ) : (
            <div className="space-y-2">
              {monthly.map((m) => (
                <div key={m.month} className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
                  <span className="text-sm font-medium">{m.month}</span>
                  <span className="text-sm">{formatCurrency(m.total)}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
