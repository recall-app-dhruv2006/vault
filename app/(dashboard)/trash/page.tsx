import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { getTrashedItems } from "@/lib/db/queries";
import { TrashList } from "@/components/items/trash-list";

export const metadata: Metadata = { title: "Trash" };

export default async function TrashPage() {
  const { userId } = await requireUser();
  const items = await getTrashedItems(userId);

  return (
    <div className="container max-w-4xl space-y-6 py-8">
      <div>
        <h1 className="text-h1">Trash</h1>
        <p className="text-muted-foreground">Items are permanently deleted 30 days after being moved here.</p>
      </div>
      <TrashList items={items} />
    </div>
  );
}
