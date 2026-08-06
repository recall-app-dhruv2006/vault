"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAddMemory } from "@/components/upload/add-memory-provider";
import { signOutAction } from "@/lib/auth/actions";
import { initialsFromName } from "@/lib/utils/format";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Topbar({
  displayName,
  email,
  avatarUrl,
  upcomingReturnsCount,
}: {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  upcomingReturnsCount: number;
}) {
  const router = useRouter();
  const { open } = useAddMemory();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
      <MobileNav />
      <form
        className="flex flex-1 items-center"
        onSubmit={(e) => { e.preventDefault(); if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`); }}
      >
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find anything you remember seeing…"
            className="pl-9 pr-16"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-caption text-muted-foreground sm:block">
            ⌘K
          </kbd>
        </div>
      </form>

      <Button onClick={() => open()} size="sm" className="hidden gap-1.5 sm:inline-flex">
        <Plus className="h-4 w-4" /> Add
      </Button>

      <Button variant="ghost" size="icon" className="relative" asChild>
        <a href="/receipts?filter=upcoming" aria-label="Upcoming return deadlines">
          <Bell className="h-4 w-4" />
          {upcomingReturnsCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-medium text-error-foreground">
              {upcomingReturnsCount > 9 ? "9+" : upcomingReturnsCount}
            </span>
          )}
        </a>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full">
          <Avatar>
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? email} />
            <AvatarFallback>{initialsFromName(displayName, email)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="truncate font-medium">{displayName ?? "Your account"}</p>
            <p className="truncate text-caption font-normal text-muted-foreground">{email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><a href="/settings">Settings</a></DropdownMenuItem>
          <DropdownMenuItem asChild><a href="/settings?tab=billing">Upgrade to Pro</a></DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-muted"
            >
              Sign out
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
