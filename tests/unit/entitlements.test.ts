import { describe, it, expect } from "vitest";
import { canUseFeature, isOverItemLimit, getItemLimit, getCollectionLimit, getMaxFileSizeBytes } from "@/lib/subscriptions/entitlements";

describe("entitlements", () => {
  it("free plan cannot use smart collections, pro can", () => {
    expect(canUseFeature("free", "smart_collections")).toBe(false);
    expect(canUseFeature("pro", "smart_collections")).toBe(true);
  });

  it("free plan has a finite item limit, pro is unlimited", () => {
    expect(getItemLimit("free")).toBe(100);
    expect(getItemLimit("pro")).toBe(Infinity);
  });

  it("flags a free user at the item limit as over", () => {
    expect(isOverItemLimit("free", 100)).toBe(true);
    expect(isOverItemLimit("free", 99)).toBe(false);
    expect(isOverItemLimit("pro", 1_000_000)).toBe(false);
  });

  it("free plan collection limit is 3", () => {
    expect(getCollectionLimit("free")).toBe(3);
  });

  it("pro plan allows larger file uploads than free", () => {
    expect(getMaxFileSizeBytes("pro")).toBeGreaterThan(getMaxFileSizeBytes("free"));
  });
});
