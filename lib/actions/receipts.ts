"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/client-server";
import { requireUser } from "@/lib/auth/current-user";
import { updateReceiptSchema } from "@/lib/validation/items";
import type { Database } from "@/types/database";

export type ActionResult = { success: true } | { success: false; error: string };

export async function updateReceiptAction(input: unknown): Promise<ActionResult> {
  const { userId } = await requireUser();
  const parsed = updateReceiptSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid receipt data." };

  const supabase = await createClient();
  const updates: Database["public"]["Tables"]["receipts"]["Update"] = {};
  if (parsed.data.merchant !== undefined) updates.merchant = parsed.data.merchant;
  if (parsed.data.purchaseDate !== undefined) updates.purchase_date = parsed.data.purchaseDate;
  if (parsed.data.subtotal !== undefined) updates.subtotal = parsed.data.subtotal;
  if (parsed.data.tax !== undefined) updates.tax = parsed.data.tax;
  if (parsed.data.total !== undefined) updates.total = parsed.data.total;
  if (parsed.data.currency !== undefined) updates.currency = parsed.data.currency;
  if (parsed.data.orderNumber !== undefined) updates.order_number = parsed.data.orderNumber;
  if (parsed.data.warrantyEnd !== undefined) updates.warranty_end = parsed.data.warrantyEnd;
  if (parsed.data.returnStatus !== undefined) updates.return_status = parsed.data.returnStatus;
  if (parsed.data.returnDeadline !== undefined) {
    updates.return_deadline = parsed.data.returnDeadline;
    updates.return_deadline_source = "manual";
  }

  const { error, data } = await supabase.from("receipts").update(updates).eq("id", parsed.data.id).eq("user_id", userId).select("item_id").single();
  if (error) return { success: false, error: "Couldn't save receipt changes." };

  revalidatePath("/receipts");
  if (data?.item_id) revalidatePath(`/item/${data.item_id}`);
  return { success: true };
}

export async function markReturnedAction(receiptId: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("receipts").update({ return_status: "returned" }).eq("id", receiptId).eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't update return status." };
  revalidatePath("/receipts");
  return { success: true };
}

export async function toggleReminderAction(receiptId: string, enabled: boolean): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("receipts").update({ reminder_enabled: enabled }).eq("id", receiptId).eq("user_id", userId);
  if (error) return { success: false, error: "Couldn't update reminder." };
  revalidatePath("/receipts");
  return { success: true };
}
