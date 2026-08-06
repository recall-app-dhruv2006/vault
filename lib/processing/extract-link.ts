import "server-only";
import { safeFetch } from "@/lib/security/ssrf";
import { stripHtml } from "@/lib/security/sanitize";

export interface LinkMetadata {
  title: string | null;
  description: string | null;
  previewImage: string | null;
  siteName: string | null;
  articleText: string;
  domain: string;
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Fetches a URL through the SSRF-safe fetcher and extracts OpenGraph
 * metadata plus readable article text. Handles blocked/failed sites
 * gracefully by returning whatever partial data was recoverable rather
 * than throwing — the caller decides whether that's enough to proceed.
 */
export async function extractLinkMetadata(url: string): Promise<LinkMetadata> {
  const domain = new URL(url).hostname.replace(/^www\./, "");

  try {
    const { text: html, contentType } = await safeFetch(url, { maxBytes: 4_000_000, timeoutMs: 12_000 });

    if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return { title: null, description: null, previewImage: null, siteName: null, articleText: "", domain };
    }

    const title = extractMeta(html, "og:title") || html.match(/<title>([^<]*)<\/title>/i)?.[1] || null;
    const description = extractMeta(html, "og:description") || extractMeta(html, "description");
    const previewImage = extractMeta(html, "og:image");
    const siteName = extractMeta(html, "og:site_name");

    // Naive readability: prefer <article>/<main>, fall back to <body>.
    const articleMatch = html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i) || html.match(/<body[\s\S]*?<\/body>/i);
    const articleText = articleMatch ? stripHtml(articleMatch[0]).slice(0, 15000) : "";

    return {
      title: title?.trim() || null,
      description: description?.trim() || null,
      previewImage: previewImage || null,
      siteName: siteName || null,
      articleText,
      domain,
    };
  } catch (error) {
    console.error(`[processing] link extraction failed for ${url}`, error);
    return { title: null, description: null, previewImage: null, siteName: null, articleText: "", domain };
  }
}

/** Cheap heuristic classification used before AI analysis, purely to pick a better prompt/UI icon early. */
export function guessLinkCategory(url: string, metadata: LinkMetadata): "product" | "recipe" | "video" | "restaurant" | "article" {
  const domain = metadata.domain.toLowerCase();
  const text = `${metadata.title ?? ""} ${metadata.description ?? ""}`.toLowerCase();
  if (/youtube\.com|youtu\.be|tiktok\.com|vimeo\.com/.test(domain)) return "video";
  if (/amazon\.|target\.com|walmart\.com|etsy\.com|shop|store/.test(domain)) return "product";
  if (/allrecipes|food\.|recipe/.test(domain) || /recipe|ingredients/.test(text)) return "recipe";
  if (/yelp\.com|opentable\.com|restaurant/.test(domain) || /menu|reservation/.test(text)) return "restaurant";
  return "article";
}
