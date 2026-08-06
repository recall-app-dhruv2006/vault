import { plans, type PlanId } from "@/lib/config/brand";

export type Feature =
  | "unlimited_items"
  | "advanced_search"
  | "receipt_reminders"
  | "smart_collections"
  | "export_tools"
  | "priority_processing"
  | "unlimited_collections";

/**
 * Single source of truth for plan-gated behavior. Every place in the app
 * that needs to know "can this user do X" calls canUseFeature() instead of
 * re-checking `profile.plan === "pro"` inline, so upgrading limits or
 * adding a new tier only requires editing lib/config/brand.ts + this file.
 */
export function canUseFeature(userPlan: PlanId, feature: Feature): boolean {
  const limits = plans[userPlan].limits;
  switch (feature) {
    case "unlimited_items": return limits.maxItems === Infinity;
    case "advanced_search": return userPlan === "pro";
    case "receipt_reminders": return limits.receiptReminders;
    case "smart_collections": return limits.smartCollections;
    case "export_tools": return limits.exportTools;
    case "priority_processing": return limits.priorityProcessing;
    case "unlimited_collections": return limits.maxCollections === Infinity;
    default: return false;
  }
}

export function getItemLimit(userPlan: PlanId): number {
  return plans[userPlan].limits.maxItems;
}

export function getCollectionLimit(userPlan: PlanId): number {
  return plans[userPlan].limits.maxCollections;
}

export function getMaxFileSizeBytes(userPlan: PlanId): number {
  return plans[userPlan].limits.maxFileSizeMb * 1_000_000;
}

export function getMaxPdfPages(userPlan: PlanId): number {
  return plans[userPlan].limits.maxPdfPages;
}

export function getDailySearchLimit(userPlan: PlanId): number {
  return plans[userPlan].limits.maxSearchesPerDay;
}

export function isOverItemLimit(userPlan: PlanId, currentItemCount: number): boolean {
  return currentItemCount >= getItemLimit(userPlan);
}
