import { buildHubs, citySlug, type CityHub } from "@/lib/cities";
import { byPrice } from "@/lib/prices";
import type { RouteRow } from "@/lib/routes/types";

// Our focus region: Turkey, the Caucasus and Central Asia, with Istanbul as the
// hub between them. Russia is deliberately excluded (sanctions; the UK government
// advises against all travel there).
export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2, as in routes.destination_country
  name: string;
  slug: string;
  // City whose photo represents the country.
  photoCity: string;
}

export const SILK_ROAD: CountryInfo[] = [
  { code: "TR", name: "Turkey", slug: "turkey", photoCity: "Istanbul" },
  { code: "GE", name: "Georgia", slug: "georgia", photoCity: "Tbilisi" },
  { code: "AZ", name: "Azerbaijan", slug: "azerbaijan", photoCity: "Baku" },
  { code: "AM", name: "Armenia", slug: "armenia", photoCity: "Yerevan" },
  { code: "UZ", name: "Uzbekistan", slug: "uzbekistan", photoCity: "Samarkand" },
  { code: "KZ", name: "Kazakhstan", slug: "kazakhstan", photoCity: "Almaty" },
  { code: "KG", name: "Kyrgyzstan", slug: "kyrgyzstan", photoCity: "Osh" },
];

// A country gets its own page once we track enough routes to it to say
// something useful (cheapest city, cheapest departure airport); otherwise it
// links to its city page.
export const MIN_COUNTRY_ROUTES = 3;

// Travellers depart from several countries ("markets"), each priced in its own
// currency, so region pages group routes by where they leave from.
export interface MarketGroup {
  code: string; // ISO code of the departure country, as in routes.origin_country
  name: string; // "the UK"
  // Routes from this market, cheapest first.
  routes: RouteRow[];
  cheapest: RouteRow | null;
  // Cheapest route from each departure city, cheapest first.
  byOrigin: RouteRow[];
}

export interface CountryGroup {
  info: CountryInfo;
  // Routes into the country, cheapest first.
  routes: RouteRow[];
  cheapest: RouteRow | null;
  // Destination cities in the country, each with its routes (cheapest first).
  cities: CityHub[];
  // Departure countries, the one with the most routes first.
  markets: MarketGroup[];
  hasPage: boolean;
}

// Countries whose name needs "the" in a sentence ("flights from the UK").
const MARKET_NAMES: Record<string, string> = { GB: "the UK", US: "the US", AE: "the UAE", NL: "the Netherlands" };
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function marketName(code: string): string {
  return MARKET_NAMES[code] ?? regionNames.of(code) ?? code;
}

function cheapestPerOrigin(routes: RouteRow[]): RouteRow[] {
  const result: RouteRow[] = [];
  for (const route of routes) {
    if (route.cheapest_price !== null && !result.some((r) => r.origin_city === route.origin_city)) result.push(route);
  }
  return result;
}

// Groups routes (already cheapest first) by departure country.
export function buildMarkets(routes: RouteRow[]): MarketGroup[] {
  const groups = new Map<string, RouteRow[]>();
  for (const route of routes) {
    const code = route.origin_country.trim();
    groups.set(code, [...(groups.get(code) ?? []), route]);
  }
  return [...groups.entries()]
    .map(([code, inMarket]) => ({
      code,
      name: marketName(code),
      routes: inMarket,
      cheapest: inMarket.find((r) => r.cheapest_price !== null) ?? null,
      byOrigin: cheapestPerOrigin(inMarket),
    }))
    .sort((a, b) => b.routes.length - a.routes.length);
}

export function countryPath(info: CountryInfo): string {
  return `/destinations/${info.slug}`;
}

export function buildCountries(routes: RouteRow[]): CountryGroup[] {
  return SILK_ROAD.map((info) => {
    const inCountry = routes.filter((r) => r.destination_country.trim() === info.code).sort(byPrice);
    return {
      info,
      routes: inCountry,
      cheapest: inCountry.find((r) => r.cheapest_price !== null) ?? null,
      cities: buildHubs(inCountry, "to").sort((a, b) => byPrice(a.cheapest ?? a.routes[0], b.cheapest ?? b.routes[0])),
      markets: buildMarkets(inCountry),
      hasPage: inCountry.length >= MIN_COUNTRY_ROUTES,
    };
  }).filter((group) => group.routes.length > 0);
}

export function findCountry(routes: RouteRow[], slug: string): CountryGroup | null {
  return buildCountries(routes).find((g) => g.info.slug === slug && g.hasPage) ?? null;
}

// Where a country card should link: its own page, or its only city's page.
export function countryHref(group: CountryGroup): string {
  if (group.hasPage) return countryPath(group.info);
  return `/flights-to/${citySlug(group.cities[0]?.name ?? group.info.photoCity)}`;
}
