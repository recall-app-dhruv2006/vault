import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInCalendarDays } from "date-fns";

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDate(dateString: string, pattern = "MMM d, yyyy"): string {
  return format(new Date(dateString), pattern);
}

export function formatCurrency(amount: number | null, currency = "USD"): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatReturnDeadline(dateString: string | null): { label: string; urgent: boolean; expired: boolean } {
  if (!dateString) return { label: "No deadline", urgent: false, expired: false };
  const date = new Date(dateString);
  const expired = isPast(date) && !isToday(date);
  if (expired) return { label: `Expired ${format(date, "MMM d")}`, urgent: false, expired: true };
  if (isToday(date)) return { label: "Due today", urgent: true, expired: false };
  if (isTomorrow(date)) return { label: "Due tomorrow", urgent: true, expired: false };
  const days = differenceInCalendarDays(date, new Date());
  return { label: `${days} days left`, urgent: days <= 5, expired: false };
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function initialsFromName(name: string | null | undefined, email: string): string {
  const trimmedName = name?.trim();
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] ?? "").concat(parts.length > 1 ? parts[1]?.[0] ?? "" : "").toUpperCase() || "?";
  }
  return (email.trim()[0] ?? "?").toUpperCase();
}

export function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}
