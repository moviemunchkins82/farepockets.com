import { buildHubs, citySlug, type CityHub } from "@/lib/cities";
import { byPrice } from "@/lib/prices";
import type { RouteRow } from "@/lib/db/schema";

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
// something useful (cheapest city, cheapest UK airport); otherwise it links
// to its city page.
export const MIN_COUNTRY_ROUTES = 3;

export interface CountryGroup {
  info: CountryInfo;
  // Routes into the country, cheapest first.
  routes: RouteRow[];
  cheapest: RouteRow | null;
  // Destination cities in the country, each with its routes (cheapest first).
  cities: CityHub[];
  // Cheapest route from each departure city, cheapest first.
  byOrigin: RouteRow[];
  hasPage: boolean;
}

export function countryPath(info: CountryInfo): string {
  return `/destinations/${info.slug}`;
}

export function buildCountries(routes: RouteRow[]): CountryGroup[] {
  return SILK_ROAD.map((info) => {
    const inCountry = routes.filter((r) => r.destination_country.trim() === info.code).sort(byPrice);
    const byOrigin: RouteRow[] = [];
    for (const route of inCountry) {
      if (route.cheapest_price !== null && !byOrigin.some((r) => r.origin_city === route.origin_city)) byOrigin.push(route);
    }
    return {
      info,
      routes: inCountry,
      cheapest: inCountry.find((r) => r.cheapest_price !== null) ?? null,
      cities: buildHubs(inCountry, "to").sort((a, b) => byPrice(a.cheapest ?? a.routes[0], b.cheapest ?? b.routes[0])),
      byOrigin,
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
