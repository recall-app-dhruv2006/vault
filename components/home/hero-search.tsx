"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const PLACEHOLDERS = [
  "Find the black desk I saved last week",
  "Show me receipts from July",
  "What was that restaurant in Pittsburgh?",
  "Find notes about my biology exam",
  "Show products under $200",
];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [placeholderIndex, setPlaceholderIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length), 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`); }}
      className="relative"
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={PLACEHOLDERS[placeholderIndex]}
        className="h-14 rounded-xl pl-12 text-base"
      />
    </form>
  );
}
