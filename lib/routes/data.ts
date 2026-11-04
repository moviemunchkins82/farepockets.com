import routesJson from "@/data/routes.json";
import pricesJson from "@/data/prices.json";
import type { PricesFile, RouteDefinition, RouteRow } from "@/lib/routes/types";

// Both files are bundled with the site, so pages never read a database or the
// filesystem: data/routes.json is written from data/routes.csv before every
// build (scripts/build-routes.ts), and data/prices.json by the price refresh
// (scripts/refresh-prices.ts). New prices reach pages by rebuilding.
const definitions = routesJson as RouteDefinition[];
const prices = pricesJson as PricesFile;

function toRow(route: RouteDefinition): RouteRow {
  const p = prices[route.slug];
  return {
    ...route,
    cheapest_price: p?.cheapest_price ?? null,
    cheapest_currency: p?.cheapest_currency ?? route.currency,
    cheapest_price_usd: p?.cheapest_price_usd ?? null,
    cheapest_depart_date: p?.cheapest_depart_date ? new Date(p.cheapest_depart_date) : null,
    price_calendar: p?.price_calendar ?? null,
    route_facts: p?.route_facts ?? null,
    last_refreshed_at: p ? new Date(p.last_refreshed_at) : null,
  };
}

const routes: RouteRow[] = definitions.map(toRow).sort((a, b) => (a.slug < b.slug ? -1 : 1));
const bySlug = new Map(routes.map((r) => [r.slug, r]));

// Async so callers don't depend on where the data comes from. A copy, so a
// caller sorting the list in place can't reorder it for everyone else.
export async function listActiveRoutes(): Promise<RouteRow[]> {
  return [...routes];
}

export async function getRouteBySlug(slug: string): Promise<RouteRow | null> {
  return bySlug.get(slug) ?? null;
}

export function listRouteDefinitions(): RouteDefinition[] {
  return definitions;
}
