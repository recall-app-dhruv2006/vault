import Image from "next/image";
import { Link2, ImageIcon, FileText, StickyNote, Receipt as ReceiptIcon, ExternalLink } from "lucide-react";
import type { ItemWithUrls } from "@/lib/db/queries";

const TYPE_ICON = { link: Link2, image: ImageIcon, pdf: FileText, note: StickyNote, receipt: ReceiptIcon } as const;

export function ItemPreview({ item }: { item: ItemWithUrls }) {
  const Icon = TYPE_ICON[item.item_type];

  if (item.item_type === "image" && item.fileUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
        <Image src={item.fileUrl} alt={item.title} fill className="object-contain" sizes="600px" />
      </div>
    );
  }

  if (item.item_type === "receipt" && item.fileUrl && item.mime_type?.startsWith("image/")) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
        <Image src={item.fileUrl} alt={item.title} fill className="object-contain" sizes="600px" />
      </div>
    );
  }

  if (item.item_type === "note") {
    return (
      <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-6 text-sm leading-relaxed">
        {item.raw_text || "This note is empty."}
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      {item.item_type === "pdf" && item.fileUrl && (
        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          Open PDF <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      {item.item_type === "link" && item.source_url && (
        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          Visit original page <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      {item.item_type === "receipt" && item.fileUrl && (
        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          Open original file <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}
