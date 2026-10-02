import type { RouteRow } from "@/lib/db/schema";

type PricedRoute = Pick<RouteRow, "cheapest_price" | "cheapest_currency" | "cheapest_price_usd">;

// A route's cheapest fare in USD, used only to rank routes priced in different
// currencies (£30 and $41 can't be compared as plain numbers). Prices are always
// displayed in the route's own currency.
export function rankingPrice(route: PricedRoute): number | null {
  if (route.cheapest_price === null) return null;
  if (route.cheapest_price_usd !== null) return Number(route.cheapest_price_usd);
  return route.cheapest_currency.trim() === "USD" ? Number(route.cheapest_price) : null;
}

// Cheapest first; routes with no comparable price go last.
export function byPrice(a: PricedRoute, b: PricedRoute): number {
  const pa = rankingPrice(a);
  const pb = rankingPrice(b);
  if (pa === null) return pb === null ? 0 : 1;
  if (pb === null) return -1;
  return pa - pb;
}

// Takes routes already in display order (e.g. cheapest first) and alternates
// their departure countries, so one market's cheaper fares (UK budget airlines,
// say) don't crowd every other country out of a mixed list. Countries with more
// routes go first in each round.
export function interleaveByOrigin<T extends Pick<RouteRow, "origin_country">>(routes: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const route of routes) {
    const key = route.origin_country.trim();
    groups.set(key, [...(groups.get(key) ?? []), route]);
  }
  const queues = [...groups.values()].sort((a, b) => b.length - a.length);
  const result: T[] = [];
  for (let i = 0; result.length < routes.length; i++) {
    for (const queue of queues) if (i < queue.length) result.push(queue[i]);
  }
  return result;
}
