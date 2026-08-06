import { describe, it, expect } from "vitest";
import { assertSafeUrl, UnsafeUrlError } from "@/lib/security/ssrf";

describe("assertSafeUrl", () => {
  it("rejects malformed URLs", async () => {
    await expect(assertSafeUrl("not a url")).rejects.toThrow(UnsafeUrlError);
  });

  it("rejects non-http(s) protocols", async () => {
    await expect(assertSafeUrl("file:///etc/passwd")).rejects.toThrow(UnsafeUrlError);
    await expect(assertSafeUrl("ftp://example.com/file")).rejects.toThrow(UnsafeUrlError);
  });

  it("rejects localhost", async () => {
    await expect(assertSafeUrl("http://localhost:3000/admin")).rejects.toThrow(UnsafeUrlError);
  });

  it("rejects direct private IPv4 addresses", async () => {
    await expect(assertSafeUrl("http://127.0.0.1/")).rejects.toThrow(UnsafeUrlError);
    await expect(assertSafeUrl("http://10.0.0.5/")).rejects.toThrow(UnsafeUrlError);
    await expect(assertSafeUrl("http://192.168.1.1/")).rejects.toThrow(UnsafeUrlError);
  });

  it("rejects the cloud metadata address", async () => {
    await expect(assertSafeUrl("http://169.254.169.254/latest/meta-data")).rejects.toThrow(UnsafeUrlError);
  });
});
