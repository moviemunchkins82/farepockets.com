import type { Metadata } from "next";
import type { RouteRow } from "@/lib/db/schema";
import { formatPrice } from "@/lib/format";
import { getCityImage } from "@/lib/cityImages";
import { routeFacts } from "@/lib/routeFacts";
import type { GuideSummary } from "@/lib/content/guides";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";

// Share image for a page about a place: the city's photo, or the site-wide
// default (app/opengraph-image.tsx), which pages lose once they set openGraph.
export function placeOgImages(city: string): NonNullable<Metadata["openGraph"]>["images"] {
  const photo = getCityImage(city);
  return photo
    ? [{ url: photo.src.src, width: photo.src.width, height: photo.src.height, alt: photo.alt }]
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }];
}

// title is bare here — the root layout's title.template appends " | {SITE_NAME}"
// automatically for every page, so appending it here too would duplicate it.

export function routeMetadata(route: RouteRow): Metadata {
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const title = `Cheap flights from ${route.origin_city} to ${route.destination_city}${price ? ` from ${price}` : ""}`;
  const facts = routeFacts(route);
  const nonstopPrice = facts?.nonstop ? formatPrice(facts.nonstop.price, route.currency) : null;
  const nonstop = !facts
    ? ""
    : nonstopPrice
      ? ` Nonstop from ${nonstopPrice}${facts.nonstop?.airline ? ` with ${facts.nonstop.airline}` : ""}.`
      : " No nonstop fares found recently.";
  const description = price
    ? `Compare ${route.origin_city} to ${route.destination_city} flights from ${price} one-way.${nonstop} See the cheapest days to fly and book with our travel partner.`
    : `Compare flights from ${route.origin_city} to ${route.destination_city}.${nonstop} See the cheapest days to fly and book with our travel partner.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/flights/${route.slug}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/flights/${route.slug}`,
      images: placeOgImages(route.destination_city),
    },
  };
}

export function guideMetadata(guide: GuideSummary): Metadata {
  const url = `${SITE_URL}/guides/${guide.slug}`;
  const photo = guide.image ? getCityImage(guide.image) : null;
  return {
    title: guide.title,
    description: guide.description,
    authors: [{ name: guide.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${guide.title} | ${SITE_NAME}`,
      description: guide.description,
      url,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt ?? guide.publishedAt,
      authors: [guide.author],
      tags: guide.tags,
      images: photo
        ? [{ url: photo.src.src, width: photo.src.width, height: photo.src.height, alt: photo.alt }]
        : undefined,
    },
  };
}
