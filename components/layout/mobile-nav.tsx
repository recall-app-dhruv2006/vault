"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Home, Search, LayoutGrid, Receipt, FolderOpen, Star, Trash2, Settings, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAddMemory } from "@/components/upload/add-memory-provider";
import { brand } from "@/lib/config/brand";

const LINKS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/items", label: "All Items", icon: LayoutGrid },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/collections", label: "Collections", icon: FolderOpen },
  { href: "/favorites", label: "Favorites", icon: Star },
  { href: "/trash", label: "Trash", icon: Trash2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { open: openAddMemory } = useAddMemory();

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs p-0 sm:max-w-xs" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="p-4">
            <p className="px-2 pb-3 text-[1.05rem] font-semibold">{brand.name}</p>
            <Button className="mb-3 w-full justify-start gap-2" onClick={() => { setOpen(false); openAddMemory(); }}>
              <Plus className="h-4 w-4" /> Add Memory
            </Button>
            <nav className="space-y-0.5">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
