import Link from "next/link";
import Image from "next/image";
import { Link2, ImageIcon, FileText, StickyNote, Receipt as ReceiptIcon, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatRelativeDate } from "@/lib/utils/format";
import type { SearchResultItem } from "@/lib/search/hybrid-search";

const TYPE_ICON = { link: Link2, image: ImageIcon, pdf: FileText, note: StickyNote, receipt: ReceiptIcon } as const;

export function ResultCard({ item, layout }: { item: SearchResultItem; layout: "grid" | "list" }) {
  const Icon = TYPE_ICON[item.item_type];
  const src = item.thumbnailUrl ?? (item.item_type === "image" ? item.fileUrl : null);

  return (
    <Link
      href={`/item/${item.id}`}
      className={cn(
        "group rounded-lg border border-border bg-surface transition-colors hover:border-primary/40",
        layout === "grid" ? "flex flex-col overflow-hidden" : "flex items-start gap-4 p-4"
      )}
    >
      <div className={cn("relative shrink-0 bg-muted", layout === "grid" ? "aspect-[4/3] w-full" : "h-16 w-16 rounded-md overflow-hidden")}>
        {src ? (
          <Image src={src} alt={item.title} fill className="object-cover" sizes="240px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary"><Icon className="h-6 w-6" /></div>
        )}
        {item.is_favorite && <Star className="absolute right-1.5 top-1.5 h-3.5 w-3.5 fill-warning text-warning" />}
      </div>
      <div className={cn("min-w-0 flex-1 space-y-1.5", layout === "grid" && "p-3")}>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <span className="shrink-0 text-caption text-muted-foreground">{formatRelativeDate(item.created_at)}</span>
        </div>
        {item.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="capitalize">{item.content_category}</Badge>
          {item.source_domain && <span className="text-caption text-muted-foreground">{item.source_domain}</span>}
        </div>
        <p className="flex items-center gap-1 text-caption text-primary"><Sparkles className="h-3 w-3 shrink-0" /> {item.matchExplanation}</p>
      </div>
    </Link>
  );
}
