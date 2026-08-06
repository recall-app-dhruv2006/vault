import { redirect, notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/db/client-server";

/** Receipt detail lives on the parent item's page (preview + extracted fields together). */
export default async function ReceiptDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const { data: receipt } = await supabase.from("receipts").select("item_id").eq("id", id).eq("user_id", userId).maybeSingle();
  if (!receipt) notFound();
  redirect(`/item/${receipt.item_id}`);
}
