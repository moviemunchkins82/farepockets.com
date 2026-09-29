import type { MetadataRoute } from "next";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { listGuideSlugs } from "@/lib/content/guides";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await listActiveRoutes();
  const guideSlugs = listGuideSlugs();

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/guides`, changeFrequency: "weekly", priority: 0.6 },
    ...routes.map((route) => ({
      url: `${SITE_URL}/flights/${route.slug}`,
      lastModified: route.last_refreshed_at ?? undefined,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...guideSlugs.map((slug) => ({
      url: `${SITE_URL}/guides/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
