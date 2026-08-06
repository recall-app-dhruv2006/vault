import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { getRecentItems } from "@/lib/db/queries";
import { ItemGrid } from "@/components/items/item-grid";

export const metadata: Metadata = { title: "Recently Added" };

export default async function RecentPage() {
  const { userId } = await requireUser();
  const items = await getRecentItems(userId, 60);

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <h1 className="text-h1">Recently Added</h1>
      <ItemGrid items={items} emptyTitle="Nothing saved yet" emptyDescription="Recently saved items will show up here first." />
    </div>
  );
}
