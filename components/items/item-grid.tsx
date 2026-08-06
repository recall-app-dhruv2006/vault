import { Sparkles } from "lucide-react";
import { ItemCard } from "@/components/items/item-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ItemWithUrls } from "@/lib/db/queries";

export function ItemGrid({
  items,
  layout = "grid",
  emptyTitle = "Nothing here yet",
  emptyDescription = "Items you save will show up here.",
}: {
  items: ItemWithUrls[];
  layout?: "grid" | "list";
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return <EmptyState icon={Sparkles} title={emptyTitle} description={emptyDescription} />;
  }

  if (layout === "list") {
    return (
      <div className="space-y-2">
        {items.map((item) => <ItemCard key={item.id} item={item} layout="list" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => <ItemCard key={item.id} item={item} layout="grid" />)}
    </div>
  );
}
