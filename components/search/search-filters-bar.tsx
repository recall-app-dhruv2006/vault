"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutToggle } from "@/components/items/layout-toggle";

const TYPES: { value: string; label: string }[] = [
  { value: "link", label: "Links" },
  { value: "image", label: "Images" },
  { value: "pdf", label: "PDFs" },
  { value: "note", label: "Notes" },
  { value: "receipt", label: "Receipts" },
];

export function SearchFiltersBar({ layout }: { layout: "grid" | "list" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTypes = searchParams.get("types")?.split(",").filter(Boolean) ?? [];
  const favoriteOnly = searchParams.get("favorite") === "true";
  const hasReturnDeadline = searchParams.get("returns") === "true";
  const sort = searchParams.get("sort") ?? "relevance";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleType(type: string) {
    const next = activeTypes.includes(type) ? activeTypes.filter((t) => t !== type) : [...activeTypes, type];
    updateParam("types", next.length ? next.join(",") : null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TYPES.map((t) => (
        <button
          key={t.value}
          onClick={() => toggleType(t.value)}
          className={cn(
            "rounded-full border px-3 py-1 text-caption transition-colors",
            activeTypes.includes(t.value) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          {t.label}
        </button>
      ))}
      <button
        onClick={() => updateParam("favorite", favoriteOnly ? null : "true")}
        className={cn(
          "flex items-center gap-1 rounded-full border px-3 py-1 text-caption transition-colors",
          favoriteOnly ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
        )}
      >
        <Star className="h-3 w-3" /> Favorites
      </button>
      <button
        onClick={() => updateParam("returns", hasReturnDeadline ? null : "true")}
        className={cn(
          "rounded-full border px-3 py-1 text-caption transition-colors",
          hasReturnDeadline ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
        )}
      >
        Has return deadline
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
          <SelectTrigger className="h-8 w-36 text-caption"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Most relevant</SelectItem>
            <SelectItem value="recent">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
        <LayoutToggle current={layout} />
      </div>
    </div>
  );
}
