import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { getItemsByType } from "@/lib/db/queries";
import { ItemGrid } from "@/components/items/item-grid";
import { LayoutToggle } from "@/components/items/layout-toggle";
import type { ItemType } from "@/types/database";

const SLUG_MAP: Record<string, { type: ItemType; label: string; empty: string }> = {
  images: { type: "image", label: "Images", empty: "Screenshots and images you save will appear here." },
  links: { type: "link", label: "Links", empty: "Links and articles you save will appear here." },
  documents: { type: "pdf", label: "Documents", empty: "PDFs and documents you save will appear here." },
  notes: { type: "note", label: "Notes", empty: "Notes you write will appear here." },
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  return { title: SLUG_MAP[type]?.label ?? "Items" };
}

export default async function ItemsByTypePage({ params, searchParams }: { params: Promise<{ type: string }>; searchParams: Promise<{ layout?: string }> }) {
  const { type } = await params;
  const config = SLUG_MAP[type];
  if (!config) notFound();

  const { userId } = await requireUser();
  const { layout: layoutParam } = await searchParams;
  const layout = layoutParam === "list" ? "list" : "grid";
  const items = await getItemsByType(userId, config.type, { limit: 60 });

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">{config.label}</h1>
        <LayoutToggle current={layout} />
      </div>
      <ItemGrid items={items} layout={layout} emptyTitle={`No ${config.label.toLowerCase()} yet`} emptyDescription={config.empty} />
    </div>
  );
}
