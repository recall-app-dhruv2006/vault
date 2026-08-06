import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/config/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/home", "/search", "/items", "/item", "/collections", "/receipts", "/settings", "/trash", "/favorites", "/onboarding", "/recent", "/api"] },
    ],
    sitemap: `${publicEnv.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
