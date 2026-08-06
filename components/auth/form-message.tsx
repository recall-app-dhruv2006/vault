import { AlertCircle, CheckCircle2 } from "lucide-react";

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <div
      role="status"
      className={
        error
          ? "flex items-start gap-2 rounded-md bg-error/10 px-3 py-2 text-sm text-error"
          : "flex items-start gap-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success"
      }
    >
      {error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{error ?? success}</span>
    </div>
  );
}
