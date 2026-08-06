import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { getFavoriteItems } from "@/lib/db/queries";
import { ItemGrid } from "@/components/items/item-grid";

export const metadata: Metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const { userId } = await requireUser();
  const items = await getFavoriteItems(userId);

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <h1 className="text-h1">Favorites</h1>
      <ItemGrid items={items} emptyTitle="No favorites yet" emptyDescription="Star an item from your library to keep it close at hand here." />
    </div>
  );
}
