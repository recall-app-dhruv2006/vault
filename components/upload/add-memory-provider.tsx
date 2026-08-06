"use client";

import * as React from "react";
import { AddMemoryDialog } from "@/components/upload/add-memory-dialog";

interface AddMemoryContextValue {
  open: (initialTab?: "link" | "image" | "pdf" | "note" | "receipt") => void;
}

const AddMemoryContext = React.createContext<AddMemoryContextValue | null>(null);

export function useAddMemory() {
  const ctx = React.useContext(AddMemoryContext);
  if (!ctx) throw new Error("useAddMemory must be used within <AddMemoryProvider>");
  return ctx;
}

export function AddMemoryProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [initialTab, setInitialTab] = React.useState<"link" | "image" | "pdf" | "note" | "receipt">("link");

  const open = React.useCallback((tab: "link" | "image" | "pdf" | "note" | "receipt" = "link") => {
    setInitialTab(tab);
    setIsOpen(true);
  }, []);

  React.useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const isTypingTarget = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "u" && !isTypingTarget) {
        e.preventDefault();
        open("link");
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open]);

  return (
    <AddMemoryContext.Provider value={{ open }}>
      {children}
      <AddMemoryDialog open={isOpen} onOpenChange={setIsOpen} initialTab={initialTab} />
    </AddMemoryContext.Provider>
  );
}
