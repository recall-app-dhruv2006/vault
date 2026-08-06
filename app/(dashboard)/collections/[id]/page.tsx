import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { getCollectionById, getCollectionItems } from "@/lib/db/queries";
import { ItemGrid } from "@/components/items/item-grid";
import { DeleteCollectionButton } from "@/components/collections/delete-collection-button";
import { formatDate } from "@/lib/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { userId } = await requireUser();
  const { id } = await params;
  const collection = await getCollectionById(userId, id);
  return { title: collection?.name ?? "Collection" };
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser();
  const { id } = await params;
  const collection = await getCollectionById(userId, id);
  if (!collection) notFound();

  const items = await getCollectionItems(collection.id);

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1">{collection.name}</h1>
          {collection.description && <p className="mt-1 text-muted-foreground">{collection.description}</p>}
          <p className="mt-1 text-caption text-muted-foreground">{items.length} items · created {formatDate(collection.created_at)}</p>
        </div>
        <DeleteCollectionButton collectionId={collection.id} name={collection.name} />
      </div>
      <ItemGrid items={items} emptyTitle="This collection is empty" emptyDescription="Add items to this collection from any item's detail page." />
    </div>
  );
}
