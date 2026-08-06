import { describe, it, expect } from "vitest";
import { parseDeterministic } from "@/lib/ai/search-query";

describe("parseDeterministic", () => {
  it("detects a price floor from 'over $100'", () => {
    const intent = parseDeterministic("receipts over $100 from last month");
    expect(intent.minimumPrice).toBe(100);
    expect(intent.contentTypes).toContain("receipt");
    expect(intent.dateRange.relative).toBe("last_month");
  });

  it("detects a price ceiling from 'under $200'", () => {
    const intent = parseDeterministic("products under $200");
    expect(intent.maximumPrice).toBe(200);
  });

  it("detects favorites and image content type", () => {
    const intent = parseDeterministic("my favorite screenshots");
    expect(intent.favoriteOnly).toBe(true);
    expect(intent.contentTypes).toContain("image");
  });

  it("detects a return-deadline query", () => {
    const intent = parseDeterministic("which return deadlines are coming up");
    expect(intent.hasReturnDeadline).toBe(true);
  });

  it("leaves filters empty for a plain semantic query", () => {
    const intent = parseDeterministic("blue Audi wheels");
    expect(intent.contentTypes).toEqual([]);
    expect(intent.minimumPrice).toBeNull();
    expect(intent.semanticQuery).toBe("blue Audi wheels");
  });
});
