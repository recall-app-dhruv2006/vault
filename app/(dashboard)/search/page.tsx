import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/db/client-server";
import { hybridSearch } from "@/lib/search/hybrid-search";
import { searchQuerySchema } from "@/lib/validation/items";
import { SearchBox } from "@/components/search/search-box";
import { SearchFiltersBar } from "@/components/search/search-filters-bar";
import { ResultCard } from "@/components/search/result-card";
import { NoResults } from "@/components/search/no-results";
import { EmptyState } from "@/components/ui/empty-state";
import { Search as SearchIcon } from "lucide-react";
import type { ItemType } from "@/types/database";

export const metadata: Metadata = { title: "Search" };

interface SearchPageParams {
  q?: string;
  types?: string;
  favorite?: string;
  returns?: string;
  sort?: string;
  layout?: string;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchPageParams> }) {
  const { userId } = await requireUser();
  const raw = await searchParams;
  const query = raw.q?.trim() ?? "";
  const layout = raw.layout === "list" ? "list" : "grid";

  const parsed = searchQuerySchema.safeParse({
    query,
    contentTypes: raw.types ? (raw.types.split(",") as ItemType[]) : undefined,
    favoriteOnly: raw.favorite === "true",
    hasReturnDeadline: raw.returns === "true",
    sort: (raw.sort as "relevance" | "recent" | "oldest") ?? "relevance",
  });

  const hasAnyCriteria = query.length > 0 || raw.types || raw.favorite === "true" || raw.returns === "true";
  const results = hasAnyCriteria && parsed.success ? await hybridSearch(userId, parsed.data) : { results: [], interpretedQuery: "" };

  if (query) {
    const supabase = await createClient();
    await supabase.from("search_history").insert({ user_id: userId, query, filters: { ...raw }, result_count: results.results.length });
  }

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <SearchBox initialQuery={query} />
      <SearchFiltersBar layout={layout} />

      {!hasAnyCriteria ? (
        <EmptyState icon={SearchIcon} title="Search your memory" description='Try something like "the blue Audi wheels I looked at last month" or "receipts over $100."' />
      ) : results.results.length === 0 ? (
        <NoResults query={query || "your filters"} />
      ) : (
        <>
          <p className="text-caption text-muted-foreground">{results.results.length} result{results.results.length === 1 ? "" : "s"}</p>
          <div className={layout === "grid" ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" : "space-y-2"}>
            {results.results.map((item) => <ResultCard key={item.id} item={item} layout={layout} />)}
          </div>
        </>
      )}
    </div>
  );
}
