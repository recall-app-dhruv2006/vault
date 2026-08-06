import Link from "next/link";
import { Receipt as ReceiptIcon } from "lucide-react";
import { ReturnDeadlineBadge } from "@/components/receipts/return-deadline-badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";

interface ReceiptRowData {
  id: string;
  merchant: string | null;
  purchase_date: string | null;
  total: number | null;
  currency: string;
  return_deadline: string | null;
  return_status: string;
  items: { id: string; title: string } | { id: string; title: string }[] | null;
}

export function ReceiptRow({ receipt }: { receipt: ReceiptRowData }) {
  const item = Array.isArray(receipt.items) ? receipt.items[0] : receipt.items;
  return (
    <Link href={item ? `/item/${item.id}` : "#"} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <ReceiptIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{receipt.merchant || item?.title || "Receipt"}</p>
        <p className="text-caption text-muted-foreground">{receipt.purchase_date ? formatDate(receipt.purchase_date) : "Date unknown"}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-medium">{formatCurrency(receipt.total, receipt.currency)}</p>
      </div>
      <div className="shrink-0"><ReturnDeadlineBadge deadline={receipt.return_deadline} status={receipt.return_status} /></div>
    </Link>
  );
}
