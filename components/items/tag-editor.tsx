"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function TagEditor({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  function commit() {
    const value = draft.trim();
    if (value && !tags.includes(value)) onChange([...tags, value]);
    setDraft("");
    setIsAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
          {tag}
          <button onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove tag ${tag}`}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {isAdding ? (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") setIsAdding(false); }}
          className="h-7 w-28 text-xs"
          placeholder="tag name"
        />
      ) : (
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-caption text-muted-foreground hover:border-primary/40 hover:text-foreground">
          <Plus className="h-3 w-3" /> Add tag
        </button>
      )}
    </div>
  );
}
