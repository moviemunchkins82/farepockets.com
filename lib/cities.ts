import { byPrice } from "@/lib/prices";
import type { RouteRow } from "@/lib/db/schema";

export type HubDirection = "to" | "from";

export interface CityHub {
  slug: string;
  name: string;
  code: string;
  // Routes arriving in (direction "to") or leaving from (direction "from") this city, cheapest first.
  routes: RouteRow[];
  cheapest: RouteRow | null;
}

export function citySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function hubPath(direction: HubDirection, city: string): string {
  return `/flights-${direction}/${citySlug(city)}`;
}

// Hubs are derived from the active routes, so adding a route to data/routes.csv
// automatically creates (or grows) the "flights to" and "flights from" pages.
export function buildHubs(routes: RouteRow[], direction: HubDirection): CityHub[] {
  const groups = new Map<string, CityHub>();
  for (const route of routes) {
    const name = direction === "to" ? route.destination_city : route.origin_city;
    const code = (direction === "to" ? route.destination_iata : route.origin_iata).trim();
    const slug = citySlug(name);
    const hub = groups.get(slug) ?? { slug, name, code, routes: [], cheapest: null };
    hub.routes.push(route);
    groups.set(slug, hub);
  }
  for (const hub of groups.values()) {
    hub.routes.sort(byPrice);
    hub.cheapest = hub.routes.find((r) => r.cheapest_price !== null) ?? null;
  }
  return [...groups.values()].sort((a, b) => b.routes.length - a.routes.length || a.name.localeCompare(b.name));
}

export function findHub(routes: RouteRow[], direction: HubDirection, slug: string): CityHub | null {
  return buildHubs(routes, direction).find((h) => h.slug === slug) ?? null;
}

// The currency most of a hub's routes are priced in (all of them, for a "from"
// hub), so its search form shows results the hub's visitors expect.
export function hubCurrency(hub: CityHub): string {
  const counts = new Map<string, number>();
  for (const route of hub.routes) counts.set(route.currency, (counts.get(route.currency) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "USD";
}
