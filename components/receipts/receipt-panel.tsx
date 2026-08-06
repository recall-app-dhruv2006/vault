"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ReturnDeadlineBadge } from "@/components/receipts/return-deadline-badge";
import { useToast } from "@/components/ui/toaster";
import { updateReceiptAction, markReturnedAction } from "@/lib/actions/receipts";
import { formatCurrency } from "@/lib/utils/format";
import type { Database } from "@/types/database";

type Receipt = Database["public"]["Tables"]["receipts"]["Row"] & {
  lineItems: Database["public"]["Tables"]["receipt_line_items"]["Row"][];
};

export function ReceiptPanel({ receipt }: { receipt: Receipt }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    merchant: receipt.merchant ?? "",
    purchaseDate: receipt.purchase_date ?? "",
    total: receipt.total?.toString() ?? "",
    tax: receipt.tax?.toString() ?? "",
    subtotal: receipt.subtotal?.toString() ?? "",
    orderNumber: receipt.order_number ?? "",
    returnDeadline: receipt.return_deadline ?? "",
    warrantyEnd: receipt.warranty_end ?? "",
  });

  async function handleSave() {
    setIsSaving(true);
    const result = await updateReceiptAction({
      id: receipt.id,
      merchant: form.merchant || null,
      purchaseDate: form.purchaseDate || null,
      total: form.total ? Number(form.total) : null,
      tax: form.tax ? Number(form.tax) : null,
      subtotal: form.subtotal ? Number(form.subtotal) : null,
      orderNumber: form.orderNumber || null,
      returnDeadline: form.returnDeadline || null,
      warrantyEnd: form.warrantyEnd || null,
    });
    setIsSaving(false);
    if (result.success) { toast({ title: "Receipt updated", variant: "success" }); setIsEditing(false); router.refresh(); }
    else toast({ title: "Couldn't save", description: result.error, variant: "error" });
  }

  async function handleMarkReturned() {
    const result = await markReturnedAction(receipt.id);
    if (result.success) { toast({ title: "Marked as returned", variant: "success" }); router.refresh(); }
  }

  const lowConfidence = receipt.extraction_confidence !== null && receipt.extraction_confidence < 0.6;

  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-label text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Receipt details <span className="text-caption">· AI extracted — please verify</span>
        </p>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => (isEditing ? handleSave() : setIsEditing(true))} disabled={isSaving}>
          {isEditing ? <><Check className="h-3.5 w-3.5" /> Save</> : <><Pencil className="h-3.5 w-3.5" /> Edit</>}
        </Button>
      </div>

      {lowConfidence && (
        <div className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-caption text-warning">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Some fields had low extraction confidence — please double-check them.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Merchant" editing={isEditing} value={form.merchant} onChange={(v) => setForm((f) => ({ ...f, merchant: v }))} display={receipt.merchant ?? "—"} />
        <Field label="Purchase date" type="date" editing={isEditing} value={form.purchaseDate} onChange={(v) => setForm((f) => ({ ...f, purchaseDate: v }))} display={receipt.purchase_date ?? "—"} />
        <Field label="Subtotal" type="number" editing={isEditing} value={form.subtotal} onChange={(v) => setForm((f) => ({ ...f, subtotal: v }))} display={formatCurrency(receipt.subtotal, receipt.currency)} />
        <Field label="Tax" type="number" editing={isEditing} value={form.tax} onChange={(v) => setForm((f) => ({ ...f, tax: v }))} display={formatCurrency(receipt.tax, receipt.currency)} />
        <Field label="Total" type="number" editing={isEditing} value={form.total} onChange={(v) => setForm((f) => ({ ...f, total: v }))} display={formatCurrency(receipt.total, receipt.currency)} />
        <Field label="Order number" editing={isEditing} value={form.orderNumber} onChange={(v) => setForm((f) => ({ ...f, orderNumber: v }))} display={receipt.order_number ?? "—"} />
        <Field label="Return deadline" type="date" editing={isEditing} value={form.returnDeadline} onChange={(v) => setForm((f) => ({ ...f, returnDeadline: v }))} display={receipt.return_deadline ?? "—"} />
        <Field label="Warranty end" type="date" editing={isEditing} value={form.warrantyEnd} onChange={(v) => setForm((f) => ({ ...f, warrantyEnd: v }))} display={receipt.warranty_end ?? "—"} />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <ReturnDeadlineBadge deadline={receipt.return_deadline} status={receipt.return_status} />
        {receipt.return_status === "open" && (
          <Button variant="outline" size="sm" onClick={handleMarkReturned}>Mark as returned</Button>
        )}
      </div>

      {receipt.lineItems.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="mb-2 text-caption text-muted-foreground">Items</p>
          <div className="space-y-1">
            {receipt.lineItems.map((li) => (
              <div key={li.id} className="flex justify-between text-sm">
                <span>{li.quantity > 1 ? `${li.quantity}× ` : ""}{li.name}</span>
                <span className="text-muted-foreground">{formatCurrency(li.total_price, receipt.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, value, onChange, display, editing, type = "text" }: { label: string; value: string; onChange: (v: string) => void; display: string; editing: boolean; type?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-caption text-muted-foreground">{label}</Label>
      {editing ? (
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} step={type === "number" ? "0.01" : undefined} />
      ) : (
        <p className="text-sm">{display}</p>
      )}
    </div>
  );
}
