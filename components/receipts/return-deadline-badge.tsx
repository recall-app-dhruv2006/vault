import { Badge } from "@/components/ui/badge";
import { formatReturnDeadline } from "@/lib/utils/format";

export function ReturnDeadlineBadge({ deadline, status }: { deadline: string | null; status: string }) {
  if (status === "returned") return <Badge variant="success">Returned</Badge>;
  if (status === "not_applicable" || !deadline) return <Badge variant="secondary">No deadline</Badge>;

  const { label, urgent, expired } = formatReturnDeadline(deadline);
  return <Badge variant={expired ? "secondary" : urgent ? "error" : "warning"}>{label}</Badge>;
}
