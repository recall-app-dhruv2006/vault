import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-16 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"><SearchX className="h-6 w-6 text-muted-foreground" /></div>
      <div className="max-w-sm space-y-1">
        <p className="text-h3">No matches for "{query}"</p>
        <p className="text-sm text-muted-foreground">Try broadening your filters, searching a related term, or browsing everything you've saved.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" asChild><Link href="/search">Clear filters</Link></Button>
        <Button variant="outline" size="sm" asChild><Link href="/items">Browse all items</Link></Button>
        <Button size="sm" asChild><Link href="/home">Save something new</Link></Button>
      </div>
    </div>
  );
}
