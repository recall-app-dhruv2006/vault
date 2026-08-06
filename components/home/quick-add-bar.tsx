"use client";

import { Link2, ImageIcon, FileText, StickyNote, Receipt as ReceiptIcon } from "lucide-react";
import { useAddMemory } from "@/components/upload/add-memory-provider";

const ACTIONS = [
  { tab: "image" as const, label: "Upload image", icon: ImageIcon },
  { tab: "link" as const, label: "Paste link", icon: Link2 },
  { tab: "note" as const, label: "Add note", icon: StickyNote },
  { tab: "pdf" as const, label: "Upload PDF", icon: FileText },
  { tab: "receipt" as const, label: "Scan receipt", icon: ReceiptIcon },
];

export function QuickAddBar() {
  const { open } = useAddMemory();
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <button
          key={action.tab}
          onClick={() => open(action.tab)}
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <action.icon className="h-4 w-4 text-primary" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
