import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { getAllItems } from "@/lib/db/queries";
import { ItemGrid } from "@/components/items/item-grid";
import { LayoutToggle } from "@/components/items/layout-toggle";

export const metadata: Metadata = { title: "All Items" };

export default async function AllItemsPage({ searchParams }: { searchParams: Promise<{ layout?: string; sort?: string }> }) {
  const { userId } = await requireUser();
  const params = await searchParams;
  const layout = params.layout === "list" ? "list" : "grid";
  const sort = (params.sort as "recent" | "oldest" | "title") ?? "recent";

  const items = await getAllItems(userId, { limit: 60, sort });

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">All Items</h1>
        <LayoutToggle current={layout} />
      </div>
      <ItemGrid items={items} layout={layout} emptyTitle="Your library is empty" emptyDescription="Save a link, screenshot, note, PDF, or receipt to start building your memory." />
    </div>
  );
}
