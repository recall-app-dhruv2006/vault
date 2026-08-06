"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Link2, ImageIcon, FileText, StickyNote, Receipt as ReceiptIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/upload/drop-zone";
import { useToast } from "@/components/ui/toaster";
import { saveNoteAction, saveLinkAction, saveImageAction, savePdfAction, saveReceiptAction } from "@/lib/actions/items";

type Tab = "link" | "image" | "pdf" | "note" | "receipt";

export function AddMemoryDialog({
  open,
  onOpenChange,
  initialTab = "link",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: Tab;
}) {
  const [tab, setTab] = React.useState<Tab>(initialTab);
  React.useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a memory</DialogTitle>
          <DialogDescription>Save something now — Recall will organize it automatically.</DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="link" title="Link"><Link2 className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="image" title="Image"><ImageIcon className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="pdf" title="PDF"><FileText className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="note" title="Note"><StickyNote className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="receipt" title="Receipt"><ReceiptIcon className="h-4 w-4" /></TabsTrigger>
          </TabsList>
          <TabsContent value="link"><LinkForm onOpenChange={onOpenChange} /></TabsContent>
          <TabsContent value="image"><FileForm kind="image" onOpenChange={onOpenChange} /></TabsContent>
          <TabsContent value="pdf"><FileForm kind="pdf" onOpenChange={onOpenChange} /></TabsContent>
          <TabsContent value="note"><NoteForm onOpenChange={onOpenChange} /></TabsContent>
          <TabsContent value="receipt"><FileForm kind="receipt" onOpenChange={onOpenChange} /></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function useSaveResult(onOpenChange: (open: boolean) => void) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = React.useState(false);

  async function handle(promise: Promise<{ success: boolean; itemId?: string; error?: string }>) {
    setIsPending(true);
    try {
      const result = await promise;
      if (result.success && result.itemId) {
        toast({ title: "Saved to Recall", description: "We're analyzing it now — it'll be searchable in a moment.", variant: "success" });
        onOpenChange(false);
        router.push(`/item/${result.itemId}`);
        router.refresh();
      } else {
        toast({ title: "Couldn't save that", description: "error" in result ? result.error : "Please try again.", variant: "error" });
      }
    } catch {
      toast({ title: "Couldn't save that", description: "Please try again.", variant: "error" });
    } finally {
      setIsPending(false);
    }
  }

  return { handle, isPending };
}

function LinkForm({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [url, setUrl] = React.useState("");
  const { handle, isPending } = useSaveResult(onOpenChange);

  return (
    <form
      className="space-y-4 pt-4"
      onSubmit={(e) => { e.preventDefault(); handle(saveLinkAction({ url })); }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="url">URL</Label>
        <Input id="url" placeholder="https://example.com/product" value={url} onChange={(e) => setUrl(e.target.value)} required autoFocus />
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !url}>
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Fetching page…</> : "Save link"}
      </Button>
    </form>
  );
}

function NoteForm({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const { handle, isPending } = useSaveResult(onOpenChange);

  return (
    <form
      className="space-y-4 pt-4"
      onSubmit={(e) => { e.preventDefault(); handle(saveNoteAction({ title: title || content.slice(0, 60) || "Untitled note", content })); }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="note-title">Title (optional)</Label>
        <Input id="note-title" placeholder="Recall will suggest one if you leave this blank" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note-content">Note</Label>
        <Textarea id="note-content" rows={6} placeholder="Write anything…" value={content} onChange={(e) => setContent(e.target.value)} required autoFocus />
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !content.trim()}>
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save note"}
      </Button>
    </form>
  );
}

const FILE_CONFIG: Record<"image" | "pdf" | "receipt", { accept: string; label: string; hint: string; action: (fd: FormData) => Promise<{ success: boolean; itemId?: string; error?: string }> }> = {
  image: { accept: "image/jpeg,image/png,image/webp,image/heic", label: "Upload a screenshot or image", hint: "JPEG, PNG, WebP, or HEIC", action: saveImageAction },
  pdf: { accept: "application/pdf", label: "Upload a PDF", hint: "Text-based PDFs work best", action: savePdfAction },
  receipt: { accept: "image/jpeg,image/png,image/webp,application/pdf", label: "Upload a receipt", hint: "Photo or PDF of your receipt", action: saveReceiptAction },
};

function FileForm({ kind, onOpenChange }: { kind: "image" | "pdf" | "receipt"; onOpenChange: (open: boolean) => void }) {
  const [file, setFile] = React.useState<File | null>(null);
  const { handle, isPending } = useSaveResult(onOpenChange);
  const config = FILE_CONFIG[kind];

  return (
    <div className="space-y-4 pt-4">
      {file ? (
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
          <span className="flex items-center gap-2 truncate"><CheckCircle2 className="h-4 w-4 shrink-0 text-success" />{file.name}</span>
          <button type="button" onClick={() => setFile(null)} className="text-caption text-muted-foreground hover:text-foreground">Change</button>
        </div>
      ) : (
        <DropZone accept={config.accept} label={config.label} hint={config.hint} onFileSelected={setFile} />
      )}
      <Button
        className="w-full"
        disabled={!file || isPending}
        onClick={() => {
          if (!file) return;
          const formData = new FormData();
          formData.set("file", file);
          handle(config.action(formData));
        }}
      >
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading & analyzing…</> : `Save ${kind}`}
      </Button>
    </div>
  );
}
