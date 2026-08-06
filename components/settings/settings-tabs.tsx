"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import { updateProfileAction, updateSettingsAction, clearSearchHistoryAction, exportDataAction } from "@/lib/actions/settings";
import { DangerZone } from "@/components/settings/danger-zone";
import { canUseFeature } from "@/lib/subscriptions/entitlements";
import { plans, type PlanId } from "@/lib/config/brand";
import type { Database } from "@/types/database";

type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];

export function SettingsTabs({
  displayName,
  email,
  plan,
  settings,
  itemCount,
  defaultTab,
}: {
  displayName: string | null;
  email: string;
  plan: PlanId;
  settings: UserSettings;
  itemCount: number;
  defaultTab: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = React.useState(displayName ?? "");
  const [local, setLocal] = React.useState(settings);

  async function saveField<K extends keyof UserSettings>(field: K, value: UserSettings[K]) {
    setLocal((prev) => ({ ...prev, [field]: value }));
    const result = await updateSettingsAction({ [field]: value } as Partial<UserSettings>);
    if (!result.success) toast({ title: "Couldn't save", description: result.error, variant: "error" });
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="flex-wrap">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="library">Library</TabsTrigger>
        <TabsTrigger value="ai">AI & Processing</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="max-w-md space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={email} disabled />
        </div>
        <Button
          onClick={async () => {
            const result = await updateProfileAction({ displayName: name });
            if (result.success) { toast({ title: "Profile updated", variant: "success" }); router.refresh(); }
            else toast({ title: "Couldn't update profile", description: result.error, variant: "error" });
          }}
        >
          Save changes
        </Button>
      </TabsContent>

      <TabsContent value="appearance" className="max-w-md space-y-4">
        <div className="space-y-1.5">
          <Label>Theme</Label>
          <Select value={local.theme} onValueChange={(v) => saveField("theme", v as UserSettings["theme"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="library" className="max-w-md space-y-4">
        <div className="space-y-1.5">
          <Label>Default view</Label>
          <Select value={local.default_view} onValueChange={(v) => saveField("default_view", v as UserSettings["default_view"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Default sort</Label>
          <Select value={local.default_sort} onValueChange={(v) => saveField("default_sort", v as UserSettings["default_sort"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Items per page</Label>
          <Select value={String(local.items_per_page)} onValueChange={(v) => saveField("items_per_page", Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[12, 24, 48, 96].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </TabsContent>

      <TabsContent value="ai" className="max-w-md space-y-4">
        <ToggleRow label="Automatic summaries" description="Generate a short summary for every saved item." checked={local.auto_summarize} onChange={(v) => saveField("auto_summarize", v)} />
        <ToggleRow label="Automatic tagging" description="Suggest tags based on content." checked={local.auto_tagging} onChange={(v) => saveField("auto_tagging", v)} />
        <ToggleRow label="Receipt extraction" description="Pull merchant, total, and return deadlines from receipts." checked={local.receipt_extraction} onChange={(v) => saveField("receipt_extraction", v)} />
        <ToggleRow label="Suggested collections" description="Recommend collections based on what you save." checked={local.suggested_collections} onChange={(v) => saveField("suggested_collections", v)} />
      </TabsContent>

      <TabsContent value="notifications" className="max-w-md space-y-4">
        <ToggleRow label="Return deadline reminders" description="In-app reminders before a return window closes." checked={local.return_reminders} onChange={(v) => saveField("return_reminders", v)} />
        <ToggleRow label="Processing completion" description="Notify when an item finishes analyzing." checked={local.processing_notifications} onChange={(v) => saveField("processing_notifications", v)} />
        <ToggleRow label="Email notifications" description="Occasional email updates about your account." checked={local.email_notifications} onChange={(v) => saveField("email_notifications", v)} />
        <ToggleRow label="Product updates" description="News about new Vault features." checked={local.product_updates} onChange={(v) => saveField("product_updates", v)} />
      </TabsContent>

      <TabsContent value="privacy" className="max-w-md space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Search history</p>
          <p className="text-sm text-muted-foreground">Vault keeps your recent searches so you can revisit them. Clear it anytime.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const result = await clearSearchHistoryAction();
              if (result.success) toast({ title: "Search history cleared", variant: "success" });
              else toast({ title: "Couldn't clear history", description: result.error, variant: "error" });
            }}
          >
            Clear search history
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Download your data</p>
          <p className="text-sm text-muted-foreground">Export everything you've saved as a JSON file.</p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!canUseFeature(plan, "export_tools")}
            onClick={async () => {
              const result = await exportDataAction();
              if (!result.success) return;
              const blob = new Blob([result.data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "vault-export.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-3.5 w-3.5" /> {canUseFeature(plan, "export_tools") ? "Export data" : "Export data (Pro)"}
          </Button>
        </div>
        <DangerZone />
      </TabsContent>

      <TabsContent value="billing" className="max-w-md space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium capitalize">{plans[plan].name} plan</p>
          <p className="text-sm text-muted-foreground">{itemCount} / {plans[plan].limits.maxItems === Infinity ? "∞" : plans[plan].limits.maxItems} items used</p>
        </div>
        {plan === "free" && (
          <Button disabled title="Billing isn't wired up yet in this MVP">Upgrade to Pro — coming soon</Button>
        )}
        <p className="text-caption text-muted-foreground">Billing is scaffolded for Stripe but not yet active. See the README for integration steps.</p>
      </TabsContent>
    </Tabs>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-caption text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
