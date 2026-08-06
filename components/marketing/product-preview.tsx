import { Hotel, MapPin, Search, Star } from "lucide-react";

const RESULTS = [
  {
    icon: Hotel,
    title: "The Standard Spa, Miami Beach",
    summary: "Boutique hotel with a rooftop pool overlooking Biscayne Bay. Saved from a travel blog while planning the March trip.",
    match: "Matched \"rooftop pool\" and \"Miami\" in saved article.",
    tag: "Travel",
  },
  {
    icon: MapPin,
    title: "1 Hotel South Beach",
    summary: "Oceanfront hotel, rooftop bar (Watr) with a pool deck. Price range noted as $$$$.",
    match: "Semantically related to your Miami trip collection.",
    tag: "Hotel",
  },
];

export function ProductPreview() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-surface p-3 shadow-lg sm:p-5">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-foreground">Find the hotel in Miami with the rooftop pool</p>
      </div>
      <div className="mt-4 space-y-3">
        {RESULTS.map((result) => (
          <div key={result.title} className="flex gap-3 rounded-lg border border-border p-3 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <result.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{result.title}</p>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground">{result.tag}</span>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{result.summary}</p>
              <p className="flex items-center gap-1 text-caption text-primary">
                <Star className="h-3 w-3" /> {result.match}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
