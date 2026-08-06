"use client";

import * as React from "react";
import { FolderOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addItemToCollectionAction, removeItemFromCollectionAction } from "@/lib/actions/collections";
import { useToast } from "@/components/ui/toaster";

export function CollectionPicker({
  itemId,
  allCollections,
  memberIds,
}: {
  itemId: string;
  allCollections: { id: string; name: string }[];
  memberIds: string[];
}) {
  const { toast } = useToast();
  const [selected, setSelected] = React.useState(new Set(memberIds));

  async function toggle(collectionId: string) {
    const isMember = selected.has(collectionId);
    const next = new Set(selected);
    isMember ? next.delete(collectionId) : next.add(collectionId);
    setSelected(next);

    const result = isMember
      ? await removeItemFromCollectionAction(collectionId, itemId)
      : await addItemToCollectionAction(collectionId, itemId);
    if (!result.success) {
      toast({ title: "Couldn't update collection", description: result.error, variant: "error" });
      setSelected(selected); // revert
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" /> Collections</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        {allCollections.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">Create a collection first from the Collections page.</p>
        ) : (
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {allCollections.map((c) => (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                {c.name}
                {selected.has(c.id) && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
