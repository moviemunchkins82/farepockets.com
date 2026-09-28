import type { Metadata } from "next";
import type { RouteRow } from "@/lib/db/schema";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";

// title is bare here — the root layout's title.template appends " | {SITE_NAME}"
// automatically for every page, so appending it here too would duplicate it.

export function routeMetadata(route: RouteRow): Metadata {
  const title = `Flights from ${route.origin_city} to ${route.destination_city}`;
  const description = route.cheapest_price
    ? `Compare ${route.origin_city} to ${route.destination_city} flights from $${route.cheapest_price}. Updated fare data, book with our travel partner.`
    : `Compare flights from ${route.origin_city} to ${route.destination_city}. Updated fare data, book with our travel partner.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/flights/${route.slug}` },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: `${SITE_URL}/flights/${route.slug}` },
  };
}

export function guideMetadata(title: string, description: string, slug: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/guides/${slug}` },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: `${SITE_URL}/guides/${slug}` },
  };
}
