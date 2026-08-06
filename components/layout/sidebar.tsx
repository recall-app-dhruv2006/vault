"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, LayoutGrid, ImageIcon, Link2, FileText, StickyNote,
  Receipt, FolderOpen, Clock, Star, Trash2, Settings, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useAddMemory } from "@/components/upload/add-memory-provider";
import { brand, plans } from "@/lib/config/brand";
import type { PlanId } from "@/lib/config/brand";

const PRIMARY_LINKS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/items", label: "All Items", icon: LayoutGrid },
];

const TYPE_LINKS = [
  { href: "/items/images", label: "Images", icon: ImageIcon },
  { href: "/items/links", label: "Links", icon: Link2 },
  { href: "/items/documents", label: "Documents", icon: FileText },
  { href: "/items/notes", label: "Notes", icon: StickyNote },
  { href: "/receipts", label: "Receipts", icon: Receipt },
];

const ORGANIZE_LINKS = [
  { href: "/collections", label: "Collections", icon: FolderOpen },
  { href: "/recent", label: "Recently Added", icon: Clock },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/home" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function Sidebar({ itemCount, plan }: { itemCount: number; plan: PlanId }) {
  const { open } = useAddMemory();
  const limit = plans[plan].limits.maxItems;
  const pct = limit === Infinity ? 0 : Math.min(100, Math.round((itemCount / limit) * 100));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-3 py-4 md:flex">
      <div className="px-2 pb-4">
        <span className="text-[1.05rem] font-semibold tracking-tight">{brand.name}</span>
      </div>
      <Button onClick={() => open()} className="mb-4 w-full justify-start gap-2">
        <Plus className="h-4 w-4" /> Add Memory
      </Button>
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div className="space-y-0.5">
          {PRIMARY_LINKS.map((l) => <NavLink key={l.href} {...l} />)}
        </div>
        <div className="space-y-0.5">
          <p className="px-3 pb-1 text-caption font-medium text-muted-foreground">Library</p>
          {TYPE_LINKS.map((l) => <NavLink key={l.href} {...l} />)}
        </div>
        <div className="space-y-0.5">
          <p className="px-3 pb-1 text-caption font-medium text-muted-foreground">Organize</p>
          {ORGANIZE_LINKS.map((l) => <NavLink key={l.href} {...l} />)}
        </div>
      </nav>
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <NavLink href="/settings" label="Settings" icon={Settings} />
        {limit !== Infinity && (
          <div className="px-3">
            <div className="flex justify-between text-caption text-muted-foreground">
              <span>{itemCount} / {limit} items</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
