"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { createCollectionAction } from "@/lib/actions/collections";

export function CreateCollectionDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  async function handleCreate() {
    setIsPending(true);
    const result = await createCollectionAction({ name, description: description || undefined });
    setIsPending(false);
    if (result.success) {
      toast({ title: "Collection created", variant: "success" });
      setOpen(false);
      setName("");
      setDescription("");
      router.refresh();
    } else {
      toast({ title: "Couldn't create collection", description: result.error, variant: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5"><FolderPlus className="h-4 w-4" /> New Collection</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New collection</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="collection-name">Name</Label>
            <Input id="collection-name" placeholder="Miami Trip" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="collection-description">Description (optional)</Label>
            <Textarea id="collection-description" placeholder="What's this collection for?" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <Button className="w-full" disabled={!name.trim() || isPending} onClick={handleCreate}>
            {isPending ? "Creating…" : "Create collection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
