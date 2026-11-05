import type { Metadata } from "next";
import type { RouteRow } from "@/lib/routes/types";
import { formatPrice, listNames } from "@/lib/format";
import { marketName } from "@/lib/regions";
import { getCityImage } from "@/lib/cityImages";
import { routeFacts, stopsSummary } from "@/lib/routeFacts";
import { calendarData, monthlyLows } from "@/components/route-page/PriceCalendar";
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

// Search results cut titles off at about 60 characters. When the " | FarePockets"
// suffix would push a title past that, drop the suffix (Google shows the site
// name next to the result anyway) rather than lose the end of the title.
const MAX_TITLE = 60;
export function pageTitle(title: string): Metadata["title"] {
  return title.length + SITE_NAME.length + 3 <= MAX_TITLE ? title : { absolute: title };
}

// The first (most keyword-rich) title that fits in a search result; the last
// candidate is the fallback when none does.
export function fitTitle(candidates: string[]): string {
  return candidates.find((t) => t.length <= MAX_TITLE) ?? candidates[candidates.length - 1];
}

// Google shows about 155 characters of a description. The first sentence
// always goes in; the rest are added in order while they fit. An extra can be
// a list of alternatives, longest first: the first that fits is used.
const MAX_DESCRIPTION = 155;
type Extra = string | string[] | null | undefined | false;
export function fitDescription(lead: string, ...extras: Extra[]): string {
  let text = lead;
  for (const extra of extras) {
    const options = Array.isArray(extra) ? extra : extra ? [extra] : [];
    const fit = options.find((o) => text.length + 1 + o.length <= MAX_DESCRIPTION);
    if (fit) text += ` ${fit}`;
  }
  return text;
}

export const DESCRIPTION_ENDING = ["See the cheapest days to fly and book with Aviasales.", "See the cheapest days to fly."];

// "Nonstop" is the US word, "direct" the UK and European one.
export function directWord(originCountry: string): "Nonstop" | "Direct" {
  return originCountry === "US" ? "Nonstop" : "Direct";
}

// The month with the lowest fare, when there are at least two months to compare
// and one is clearly cheaper (the same figure as the route FAQ's "cheapest month").
function cheapestMonth(route: RouteRow): string | null {
  const calendar = calendarData(route);
  const lows = calendar ? monthlyLows(calendar) : [];
  if (lows.length < 2) return null;
  const sorted = [...lows].sort((a, b) => a.price - b.price);
  return sorted[0].price < sorted[1].price ? sorted[0].label : null;
}

// The cheapest fare from each departure country, in that country's currency,
// the country with the most routes first.
export function faresByMarket(routes: RouteRow[]): { market: string; price: string; routes: number }[] {
  const markets = new Map<string, { best: RouteRow | null; routes: number }>();
  for (const route of routes) {
    const m = markets.get(route.origin_country) ?? { best: null, routes: 0 };
    m.routes += 1;
    if (route.cheapest_price !== null && (!m.best || route.cheapest_price < (m.best.cheapest_price ?? Infinity))) m.best = route;
    markets.set(route.origin_country, m);
  }
  return [...markets.entries()]
    .sort((a, b) => b[1].routes - a[1].routes)
    .flatMap(([code, m]) => {
      const price = m.best && formatPrice(m.best.cheapest_price, m.best.cheapest_currency);
      return price ? [{ market: marketName(code), price, routes: m.routes }] : [];
    });
}

// "London, Edinburgh, Birmingham and 3 more"
export function shortList(names: string[], max = 3): string {
  return names.length <= max ? listNames(names) : `${names.slice(0, max).join(", ")} and ${names.length - max} more`;
}

// How many of these routes had a direct fare in recent searches, e.g. "Direct flights on 5 of 6 routes."
export function directCount(routes: RouteRow[]): string | null {
  const withFacts = routes.filter((r) => routeFacts(r));
  if (withFacts.length === 0) return null;
  const direct = withFacts.filter((r) => routeFacts(r)?.nonstop).length;
  const word = withFacts.every((r) => r.origin_country === "US") ? "Nonstop" : "Direct";
  if (direct === 0) return `No ${word.toLowerCase()} flights found recently.`;
  if (withFacts.length === 1) {
    const r = withFacts[0];
    const n = routeFacts(r)!.nonstop!;
    return `${word} flights from ${formatPrice(n.price, r.currency)}${n.airline ? ` with ${n.airline}` : ""}.`;
  }
  return direct === withFacts.length
    ? `${word} flights on every route.`
    : `${word} flights on ${direct} of ${withFacts.length} routes.`;
}

export function routeMetadata(route: RouteRow): Metadata {
  const from = route.origin_city;
  const to = route.destination_city;
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const codes = `(${route.origin_iata.trim()}–${route.destination_iata.trim()})`;
  // Matches "cheap flights London to Tashkent", "London to Tashkent flights" and
  // "LON to TAS"; the page's H1 carries the "flights from London to Tashkent" form.
  // No prices in titles: they change daily, and the description carries them.
  const title = fitTitle([
    `Cheap ${from} to ${to} flights ${codes}`,
    `Cheap ${from} to ${to} flights`,
    `${from} to ${to} flights`,
  ]);

  const facts = routeFacts(route);
  const word = directWord(route.origin_country);
  const nonstopPrice = facts?.nonstop ? formatPrice(facts.nonstop.price, route.currency) : null;
  const stops = facts ? stopsSummary(facts) : null;
  const direct = !facts
    ? null
    : nonstopPrice
      ? `${word} flights from ${nonstopPrice}${facts.nonstop?.airline ? ` with ${facts.nonstop.airline}` : ""}.`
      : `No ${word.toLowerCase()} flights found recently${stops ? `; ${stops.headline.replace(/^Mix/, "a mix").replace(/^Mostly/, "mostly")}` : ""}.`;
  const month = cheapestMonth(route);

  const description = fitDescription(
    price ? `Find flights from ${from} to ${to} from ${price} one-way.` : `Compare flights from ${from} to ${to}.`,
    direct,
    month && `${month} has the lowest fares.`,
    DESCRIPTION_ENDING,
  );

  return {
    title: pageTitle(title),
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
    title: pageTitle(guide.seoTitle ?? guide.title),
    description: guide.description,
    authors: [{ name: guide.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${guide.seoTitle ?? guide.title} | ${SITE_NAME}`,
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
