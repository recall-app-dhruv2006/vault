import { Loader2, CheckCircle2, AlertCircle, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProcessingStatus } from "@/types/database";

const CONFIG: Record<ProcessingStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "secondary"; icon: React.ElementType; spin?: boolean }> = {
  uploaded: { label: "Uploaded", icon: Clock, variant: "secondary" },
  queued: { label: "Queued", icon: Clock, variant: "secondary" },
  processing: { label: "Analyzing…", icon: Loader2, variant: "default", spin: true },
  completed: { label: "Ready", icon: CheckCircle2, variant: "success" },
  needs_review: { label: "Needs review", icon: Eye, variant: "warning" },
  failed: { label: "Failed", icon: AlertCircle, variant: "error" },
};

export function ProcessingBadge({ status }: { status: ProcessingStatus }) {
  const config = CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className={`h-3 w-3 ${config.spin ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}
