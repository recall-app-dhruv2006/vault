"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star, Trash2, RotateCw, Pencil, Check, X, Sparkles, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ItemPreview } from "@/components/items/item-preview";
import { ProcessingBadge } from "@/components/items/processing-badge";
import { TagEditor } from "@/components/items/tag-editor";
import { CollectionPicker } from "@/components/items/collection-picker";
import { ItemGrid } from "@/components/items/item-grid";
import { useToast } from "@/components/ui/toaster";
import { formatDate, formatBytes } from "@/lib/utils/format";
import { toggleFavoriteAction, updateItemAction, moveToTrashAction, retryProcessingAction } from "@/lib/actions/items";
import type { ItemWithUrls } from "@/lib/db/queries";
import type { ItemAnalysis } from "@/lib/ai/schemas";

export function ItemDetailView({
  item,
  tags: initialTags,
  relatedItems,
  collections,
  memberCollectionIds,
  receiptPanel,
}: {
  item: ItemWithUrls;
  tags: { id: string; name: string }[];
  relatedItems: ItemWithUrls[];
  collections: { id: string; name: string }[];
  memberCollectionIds: string[];
  receiptPanel?: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const analysis = item.ai_analysis as ItemAnalysis | null;

  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(item.title);
  const [summary, setSummary] = React.useState(item.summary ?? "");
  const [tags, setTags] = React.useState(initialTags.map((t) => t.name));
  const [isFavorite, setIsFavorite] = React.useState(item.is_favorite);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRetrying, setIsRetrying] = React.useState(false);

  async function handleSave() {
    setIsSaving(true);
    const result = await updateItemAction({ id: item.id, title, summary, tags });
    setIsSaving(false);
    if (result.success) {
      toast({ title: "Changes saved", variant: "success" });
      setIsEditing(false);
      router.refresh();
    } else {
      toast({ title: "Couldn't save changes", description: result.error, variant: "error" });
    }
  }

  async function handleFavorite() {
    setIsFavorite((v) => !v);
    const result = await toggleFavoriteAction(item.id, !isFavorite);
    if (!result.success) setIsFavorite((v) => !v);
  }

  async function handleRetry() {
    setIsRetrying(true);
    const result = await retryProcessingAction(item.id);
    setIsRetrying(false);
    if (result.success) { toast({ title: "Reprocessing started", variant: "success" }); router.refresh(); }
    else toast({ title: "Retry failed", description: result.error, variant: "error" });
  }

  async function handleDelete() {
    const result = await moveToTrashAction(item.id);
    if (result.success) { toast({ title: "Moved to Trash", variant: "success" }); router.push("/items"); }
    else toast({ title: "Couldn't delete", description: result.error, variant: "error" });
  }

  return (
    <div className="container max-w-4xl space-y-8 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          {isEditing ? (
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-h2 font-semibold" />
          ) : (
            <h1 className="text-h2">{item.title}</h1>
          )}
          <div className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
            <Badge variant="secondary" className="capitalize">{item.content_category}</Badge>
            <ProcessingBadge status={item.processing_status} />
            <span>Saved {formatDate(item.created_at)}</span>
            {item.source_domain && <span>· {item.source_domain}</span>}
            {item.file_size && <span>· {formatBytes(item.file_size)}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleFavorite} aria-label="Toggle favorite">
            <Star className={isFavorite ? "h-4 w-4 fill-warning text-warning" : "h-4 w-4"} />
          </Button>
          {isEditing ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} aria-label="Cancel"><X className="h-4 w-4" /></Button>
              <Button size="icon" onClick={handleSave} disabled={isSaving} aria-label="Save"><Check className="h-4 w-4" /></Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsEditing(true)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Move "{item.title}" to Trash?</AlertDialogTitle>
                <AlertDialogDescription>You can restore it from Trash within 30 days.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Move to Trash</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {(item.processing_status === "failed" || item.processing_status === "needs_review") && (
        <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <span>
            {item.processing_status === "failed"
              ? item.processing_error
                ? `We couldn't fully analyze this item: ${item.processing_error} Your original file is still saved.`
                : "We couldn't fully analyze this item. Your original file is still saved."
              : "This item needs a quick review — some extracted details may be incomplete."}
          </span>
          <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={handleRetry} disabled={isRetrying}>
            <RotateCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} /> Retry
          </Button>
        </div>
      )}

      <ItemPreview item={item} />

      <div className="flex flex-wrap items-center gap-2">
        <CollectionPicker itemId={item.id} allCollections={collections} memberIds={memberCollectionIds} />
        {item.source_url && (
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <a href={item.source_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Open source</a>
          </Button>
        )}
      </div>

      <section className="space-y-2">
        <p className="flex items-center gap-1.5 text-label text-muted-foreground"><Sparkles className="h-3.5 w-3.5" /> Summary <span className="text-caption">· Generated by Vault</span></p>
        {isEditing ? (
          <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} />
        ) : (
          <p className="text-sm text-foreground">{item.summary || "No summary available yet."}</p>
        )}
      </section>

      <section className="space-y-2">
        <p className="text-label text-muted-foreground">Tags</p>
        {isEditing ? (
          <TagEditor tags={tags} onChange={setTags} />
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags yet.</p>}
            {tags.map((tag) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}><Badge variant="secondary">{tag}</Badge></Link>
            ))}
          </div>
        )}
      </section>

      {analysis && (
        <section className="space-y-2">
          <p className="flex items-center gap-1.5 text-label text-muted-foreground"><Sparkles className="h-3.5 w-3.5" /> Extracted details <span className="text-caption">· Generated by Vault</span></p>
          <div className="grid gap-2 rounded-lg border border-border p-4 sm:grid-cols-2">
            <EntityRow label="People" values={analysis.entities.people} />
            <EntityRow label="Organizations" values={analysis.entities.organizations} />
            <EntityRow label="Places" values={analysis.entities.places} />
            <EntityRow label="Products" values={analysis.entities.products} />
            <EntityRow label="Brands" values={analysis.entities.brands} />
            <EntityRow label="Dates" values={analysis.entities.dates} />
            {analysis.entities.prices.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-caption text-muted-foreground">Prices</p>
                <p className="text-sm">{analysis.entities.prices.map((p) => `${p.amount} ${p.currency}`).join(", ")}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {receiptPanel}

      {item.raw_text && item.item_type !== "note" && (
        <section className="space-y-2">
          <p className="text-label text-muted-foreground">Extracted text</p>
          <details className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer text-sm text-primary">Show extracted text ({item.raw_text.length.toLocaleString()} characters)</summary>
            <p className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">{item.raw_text}</p>
          </details>
        </section>
      )}

      {relatedItems.length > 0 && (
        <section className="space-y-3">
          <p className="text-label text-muted-foreground">Related items</p>
          <ItemGrid items={relatedItems} />
        </section>
      )}
    </div>
  );
}

function EntityRow({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null;
  return (
    <div>
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="text-sm">{values.join(", ")}</p>
    </div>
  );
}
