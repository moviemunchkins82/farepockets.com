import type { MetadataRoute } from "next";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { listGuideSlugs } from "@/lib/content/guides";
import { buildHubs, hubPath, type HubDirection } from "@/lib/cities";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";

export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await listActiveRoutes();
  const guideSlugs = listGuideSlugs();
  const hubs = (["to", "from"] as HubDirection[]).flatMap((direction) =>
    buildHubs(routes, direction).map((hub) => ({
      url: `${SITE_URL}${hubPath(direction, hub.name)}`,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
  );

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/flights`, changeFrequency: "daily", priority: 0.9 },
    ...hubs,
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
