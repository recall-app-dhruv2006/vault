import { Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { brand } from "@/lib/config/brand";

export function Logo({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold text-foreground", className)}>
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Lock className="h-4 w-4" />
      </span>
      {!iconOnly && <span className="text-[1.05rem] tracking-tight">{brand.name}</span>}
    </span>
  );
}
