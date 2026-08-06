import { describe, it, expect } from "vitest";
import { formatCurrency, formatBytes, truncate, initialsFromName } from "@/lib/utils/format";

describe("formatCurrency", () => {
  it("formats a USD amount", () => {
    expect(formatCurrency(412.99, "USD")).toBe("$412.99");
  });
  it("renders an em dash for null", () => {
    expect(formatCurrency(null)).toBe("—");
  });
});

describe("formatBytes", () => {
  it("formats bytes into human units", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1500)).toBe("1.5 KB");
  });
  it("renders an em dash for null", () => {
    expect(formatBytes(null)).toBe("—");
  });
});

describe("truncate", () => {
  it("leaves short strings alone", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });
  it("truncates long strings with an ellipsis", () => {
    expect(truncate("a very long piece of text", 10)).toBe("a very lon…");
  });
});

describe("initialsFromName", () => {
  it("uses display name when available", () => {
    expect(initialsFromName("Dhruv Patel", "x@example.com")).toBe("DP");
  });
  it("falls back to email when no name", () => {
    expect(initialsFromName(null, "dhruv@example.com")).toBe("D");
  });
});
