import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/pricing", "/privacy", "/terms", "/security", "/contact", "/sign-in", "/sign-up"];
  return routes.map((route) => ({
    url: `${publicEnv.NEXT_PUBLIC_APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.6,
  }));
}
