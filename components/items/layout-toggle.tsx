"use client";

import { LayoutGrid, List } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function LayoutToggle({ current }: { current: "grid" | "list" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setLayout(layout: "grid" | "list") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", layout);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center rounded-md border border-border p-0.5">
      <button
        onClick={() => setLayout("grid")}
        aria-label="Grid view"
        className={cn("rounded p-1.5", current === "grid" ? "bg-muted text-foreground" : "text-muted-foreground")}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => setLayout("list")}
        aria-label="List view"
        className={cn("rounded p-1.5", current === "list" ? "bg-muted text-foreground" : "text-muted-foreground")}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
