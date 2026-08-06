import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import {
  getItemById, getItemTags, getRelatedItems, getCollections, getItemCollectionIds, recordItemView,
} from "@/lib/db/queries";
import { getReceiptByItemId } from "@/lib/db/receipts";
import { ItemDetailView } from "@/components/items/item-detail-view";
import { ReceiptPanel } from "@/components/receipts/receipt-panel";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { userId } = await requireUser();
  const { id } = await params;
  const item = await getItemById(userId, id);
  return { title: item?.title ?? "Item" };
}

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser();
  const { id } = await params;
  const item = await getItemById(userId, id);
  if (!item) notFound();

  const [tags, relatedItems, collections, memberCollectionIds, receipt] = await Promise.all([
    getItemTags(item.id),
    getRelatedItems(userId, item.id),
    getCollections(userId),
    getItemCollectionIds(item.id),
    item.item_type === "receipt" ? getReceiptByItemId(item.id) : Promise.resolve(null),
  ]);

  recordItemView(userId, item.id).catch(() => {});

  return (
    <ItemDetailView
      item={item}
      tags={tags}
      relatedItems={relatedItems}
      collections={collections.map((c) => ({ id: c.id, name: c.name }))}
      memberCollectionIds={memberCollectionIds}
      receiptPanel={receipt ? <ReceiptPanel receipt={receipt} /> : undefined}
    />
  );
}
