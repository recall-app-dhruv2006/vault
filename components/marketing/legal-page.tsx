import { brand } from "@/lib/config/brand";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container max-w-3xl py-16">
      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
        This page is an initial template for the MVP and requires legal review before commercial launch.
      </div>
      <h1 className="mt-6 text-h1">{title}</h1>
      <p className="mt-1 text-caption text-muted-foreground">Last updated {brand.legal.lastUpdated}</p>
      <div className="prose prose-neutral mt-8 max-w-none space-y-5 text-sm leading-relaxed text-foreground [&_h2]:mt-8 [&_h2]:text-h3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
        {children}
      </div>
    </div>
  );
}
