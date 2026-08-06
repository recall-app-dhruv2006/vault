"use client";

import Link from "next/link";
import Image from "next/image";
import { Link2, ImageIcon, FileText, StickyNote, Receipt as ReceiptIcon, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProcessingBadge } from "@/components/items/processing-badge";
import { formatRelativeDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toggleFavoriteAction } from "@/lib/actions/items";
import type { ItemWithUrls } from "@/lib/db/queries";

const TYPE_ICON = { link: Link2, image: ImageIcon, pdf: FileText, note: StickyNote, receipt: ReceiptIcon } as const;

export function ItemCard({ item, layout = "grid" }: { item: ItemWithUrls; layout?: "grid" | "list" }) {
  const Icon = TYPE_ICON[item.item_type];
  const showProcessing = item.processing_status !== "completed";

  if (layout === "list") {
    return (
      <Link href={`/item/${item.id}`} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-primary/40">
        <Thumbnail item={item} icon={Icon} className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{item.title}</p>
            {item.is_favorite && <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" />}
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground">{item.summary}</p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {showProcessing && <ProcessingBadge status={item.processing_status} />}
          <span className="text-caption text-muted-foreground">{formatRelativeDate(item.created_at)}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/items/${item.id}`} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary/40">
      <div className="relative aspect-[4/3] w-full bg-muted">
        <Thumbnail item={item} icon={Icon} className="h-full w-full" fill />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); toggleFavoriteAction(item.id, !item.is_favorite); }}
          aria-label={item.is_favorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition-opacity"
        >
          <Star className={cn("h-3.5 w-3.5", item.is_favorite ? "fill-warning text-warning" : "text-muted-foreground")} />
        </button>
        {showProcessing && (
          <div className="absolute bottom-2 left-2"><ProcessingBadge status={item.processing_status} /></div>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
        {item.summary && <p className="line-clamp-2 text-caption text-muted-foreground">{item.summary}</p>}
        <div className="flex items-center justify-between pt-1">
          <Badge variant="secondary" className="capitalize">{item.content_category}</Badge>
          <span className="text-caption text-muted-foreground">{formatRelativeDate(item.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

function Thumbnail({ item, icon: Icon, className, fill }: { item: ItemWithUrls; icon: React.ElementType; className?: string; fill?: boolean }) {
  const src = item.thumbnailUrl ?? (item.item_type === "image" ? item.fileUrl : null);
  if (src) {
    return fill ? (
      <Image src={src} alt={item.title} fill className={cn("object-cover", className)} sizes="(max-width: 768px) 50vw, 25vw" />
    ) : (
      <Image src={src} alt={item.title} width={56} height={56} className={cn("rounded-md object-cover", className)} />
    );
  }
  return (
    <div className={cn("flex items-center justify-center rounded-md bg-primary/5 text-primary", className)}>
      <Icon className="h-6 w-6" />
    </div>
  );
}
