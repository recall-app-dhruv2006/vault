"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Brain, Camera, ShoppingBag, GraduationCap, Plane, ChefHat, Receipt,
  FileText, Clapperboard, StickyNote, Check, Link2, ImageIcon, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { savePreferencesAction, setOnboardingStepAction, completeOnboardingAction } from "@/lib/actions/onboarding";
import { saveNoteAction, saveLinkAction } from "@/lib/actions/items";
import { useToast } from "@/components/ui/toaster";

const STEPS = ["welcome", "preferences", "first_save", "privacy"] as const;
type Step = (typeof STEPS)[number];

const PREFERENCE_OPTIONS = [
  { id: "screenshots", label: "Screenshots", icon: Camera },
  { id: "shopping", label: "Shopping items", icon: ShoppingBag },
  { id: "school", label: "School material", icon: GraduationCap },
  { id: "travel", label: "Travel ideas", icon: Plane },
  { id: "recipes", label: "Recipes", icon: ChefHat },
  { id: "receipts", label: "Receipts", icon: Receipt },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "videos", label: "Videos", icon: Clapperboard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "notes", label: "Notes", icon: StickyNote },
];

export function OnboardingFlow({ initialStep, displayName }: { initialStep: string; displayName: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = React.useState<Step>((STEPS as readonly string[]).includes(initialStep) ? (initialStep as Step) : "welcome");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [savedItemId, setSavedItemId] = React.useState<string | null>(null);

  const stepIndex = STEPS.indexOf(step);

  function goTo(next: Step) {
    setStep(next);
    setOnboardingStepAction(next);
  }

  return (
    <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 shadow-sm">
      <div className="mb-8 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className={cn("h-1 flex-1 rounded-full", i <= stepIndex ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

      {step === "welcome" && (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Brain className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-h2">Welcome{displayName ? `, ${displayName.split(" ")[0]}` : ""}.</h1>
            <p className="text-muted-foreground">Recall is your private, searchable memory. Save anything — Recall organizes it and helps you find it again with plain language, not exact keywords.</p>
          </div>
          <Button className="w-full" onClick={() => goTo("preferences")}>Get started</Button>
        </div>
      )}

      {step === "preferences" && (
        <div className="space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-h2">What do you save most?</h1>
            <p className="text-muted-foreground">Pick as many as you like — this just helps us tailor suggestions.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PREFERENCE_OPTIONS.map((opt) => {
              const isSelected = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected((prev) => (isSelected ? prev.filter((id) => id !== opt.id) : [...prev, opt.id]))}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                    isSelected ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                  )}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                  {isSelected && <Check className="ml-auto h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
          <Button
            className="w-full"
            onClick={async () => { await savePreferencesAction(selected); goTo("first_save"); }}
          >
            Continue
          </Button>
        </div>
      )}

      {step === "first_save" && (
        <FirstSaveStep
          onSkip={() => goTo("privacy")}
          onSaved={(id) => { setSavedItemId(id); goTo("privacy"); }}
          toast={toast}
        />
      )}

      {step === "privacy" && (
        <div className="space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-7 w-7" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-h2">Your privacy, plainly</h1>
            <p className="text-muted-foreground">
              What you save is private to you. When you save something, Recall's AI reads it to generate a title,
              summary, and tags so you can find it later — that's the only reason your content is processed. It's
              never shown to other users, never sold, and you can delete anything at any time.
            </p>
          </div>
          <Button className="w-full" onClick={() => completeOnboardingAction()}>
            {savedItemId ? "Go to my memory library" : "Start using Recall"}
          </Button>
        </div>
      )}
    </div>
  );
}

function FirstSaveStep({ onSkip, onSaved, toast }: { onSkip: () => void; onSaved: (id: string) => void; toast: (t: { title: string; description?: string; variant?: "success" | "error" }) => void }) {
  const [mode, setMode] = React.useState<"link" | "note">("note");
  const [url, setUrl] = React.useState("");
  const [noteContent, setNoteContent] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  async function handleSave() {
    setIsPending(true);
    const result = mode === "link"
      ? await saveLinkAction({ url })
      : await saveNoteAction({ title: noteContent.slice(0, 60) || "My first note", content: noteContent });
    setIsPending(false);
    if (result.success) {
      toast({ title: "Saved! Recall is analyzing it now.", variant: "success" });
      onSaved(result.itemId);
    } else {
      toast({ title: "Couldn't save that", description: result.error, variant: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-h2">Save your first memory</h1>
        <p className="text-muted-foreground">Try it now — paste a link or write a quick note.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setMode("note")} className={cn("flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm", mode === "note" ? "border-primary bg-primary/5 text-primary" : "border-border")}>
          <StickyNote className="h-4 w-4" /> Note
        </button>
        <button onClick={() => setMode("link")} className={cn("flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm", mode === "link" ? "border-primary bg-primary/5 text-primary" : "border-border")}>
          <Link2 className="h-4 w-4" /> Link
        </button>
      </div>
      {mode === "note" ? (
        <Textarea placeholder="Anything you want to remember…" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={4} />
      ) : (
        <Input placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
      )}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onSkip}>Skip for now</Button>
        <Button className="flex-1" disabled={isPending || (mode === "note" ? !noteContent.trim() : !url)} onClick={handleSave}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
