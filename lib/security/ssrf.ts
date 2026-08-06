import "server-only";
import dns from "node:dns/promises";
import net from "node:net";

/**
 * SSRF protection for user-supplied URLs (link saving, favicon/OG-image
 * fetches). Blocks localhost, private/link-local ranges, cloud metadata
 * endpoints, non-HTTP(S) schemes, and DNS answers that resolve into those
 * ranges (so an attacker can't bypass the check with DNS rebinding).
 */

const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "metadata.google.internal"]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts as [number, number, number, number];
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local / cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  return lower === "::1" || lower.startsWith("fe80") || lower.startsWith("fc") || lower.startsWith("fd");
}

export class UnsafeUrlError extends Error {}

export async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("That doesn't look like a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http and https links can be saved.");
  }

  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new UnsafeUrlError("This URL points to a restricted address.");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
      throw new UnsafeUrlError("This URL points to a restricted address.");
    }
    return url;
  }

  // Resolve DNS ourselves and check every returned address, closing the
  // DNS-rebinding gap where the hostname looks public but resolves private.
  try {
    const records = await dns.lookup(hostname, { all: true });
    for (const record of records) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        throw new UnsafeUrlError("This URL points to a restricted address.");
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        throw new UnsafeUrlError("This URL points to a restricted address.");
      }
    }
  } catch (error) {
    if (error instanceof UnsafeUrlError) throw error;
    throw new UnsafeUrlError("We couldn't resolve that URL.");
  }

  return url;
}

/** Fetch a URL with SSRF protection, a timeout, redirect-following capped and re-validated, and a max body size. */
export async function safeFetch(rawUrl: string, opts: { maxBytes?: number; timeoutMs?: number } = {}): Promise<{ url: string; status: number; text: string; contentType: string | null }> {
  const maxBytes = opts.maxBytes ?? 3_000_000;
  const timeoutMs = opts.timeoutMs ?? 10_000;

  let currentUrl = (await assertSafeUrl(rawUrl)).toString();
  let redirects = 0;

  while (redirects <= 5) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(currentUrl, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "VaultBot/1.0 (+https://vault.app/bot)" },
      });
    } finally {
      clearTimeout(timer);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new UnsafeUrlError("Redirect with no destination.");
      currentUrl = (await assertSafeUrl(new URL(location, currentUrl).toString())).toString();
      redirects += 1;
      continue;
    }

    const contentType = response.headers.get("content-type");
    const reader = response.body?.getReader();
    let received = 0;
    const chunks: Uint8Array[] = [];
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > maxBytes) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
    }
    const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");
    return { url: currentUrl, status: response.status, text, contentType };
  }

  throw new UnsafeUrlError("Too many redirects.");
}
