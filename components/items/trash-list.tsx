"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toaster";
import { restoreFromTrashAction, permanentlyDeleteItemAction, emptyTrashAction } from "@/lib/actions/items";
import { formatRelativeDate } from "@/lib/utils/format";
import type { ItemWithUrls } from "@/lib/db/queries";

export function TrashList({ items }: { items: ItemWithUrls[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = React.useState(false);

  async function handleRestore(id: string) {
    setIsPending(true);
    const result = await restoreFromTrashAction(id);
    setIsPending(false);
    if (result.success) { toast({ title: "Item restored", variant: "success" }); router.refresh(); }
    else toast({ title: "Couldn't restore", description: result.error, variant: "error" });
  }

  async function handleDelete(id: string) {
    setIsPending(true);
    const result = await permanentlyDeleteItemAction(id);
    setIsPending(false);
    if (result.success) { toast({ title: "Permanently deleted", variant: "success" }); router.refresh(); }
    else toast({ title: "Couldn't delete", description: result.error, variant: "error" });
  }

  async function handleEmptyTrash() {
    setIsPending(true);
    const result = await emptyTrashAction();
    setIsPending(false);
    if (result.success) { toast({ title: `Trash emptied (${result.deletedCount} items)`, variant: "success" }); router.refresh(); }
    else toast({ title: "Couldn't empty trash", description: result.error, variant: "error" });
  }

  if (items.length === 0) {
    return <EmptyState icon={Trash2} title="Trash is empty" description="Deleted items stay here for 30 days before being permanently removed." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5"><Trash2 className="h-3.5 w-3.5" /> Empty trash</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Permanently delete everything in Trash?</AlertDialogTitle>
              <AlertDialogDescription>This removes {items.length} item{items.length === 1 ? "" : "s"}, their files, and their embeddings. This can't be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={isPending} onClick={handleEmptyTrash}>Empty trash</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-caption text-muted-foreground">Deleted {item.deleted_at ? formatRelativeDate(item.deleted_at) : ""}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleRestore(item.id)} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Restore
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-1.5"><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Permanently delete "{item.title}"?</AlertDialogTitle>
                    <AlertDialogDescription>This removes the item, its files, and its embeddings. This can't be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={isPending} onClick={() => handleDelete(item.id)}>Delete forever</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
