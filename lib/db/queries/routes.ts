import { cache } from "react";
import type { JSONValue } from "postgres";
import sql from "@/lib/db/client";
import type { RouteRow } from "@/lib/db/schema";
import type { PriceCalendarData, RouteFacts } from "@/lib/travelpayouts/types";

// During `next build` each worker prerenders dozens of pages that all need this
// list; reuse one query per worker instead of one per page, so a slow database
// connection can't time the build out. Never used at runtime, where pages must
// see fresh prices right after a refresh.
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
let buildRoutes: Promise<RouteRow[]> | null = null;

function queryActiveRoutes(): Promise<RouteRow[]> {
  return sql<RouteRow[]>`
    SELECT * FROM routes WHERE is_active = true ORDER BY slug
  `;
}

// cache() dedupes this within one render: the header, footer and page all read it.
export const listActiveRoutes = cache(async (): Promise<RouteRow[]> => {
  if (!IS_BUILD) return queryActiveRoutes();
  if (!buildRoutes) {
    buildRoutes = queryActiveRoutes();
    // A failed query isn't reused; the next page tries again.
    buildRoutes.catch(() => {
      buildRoutes = null;
    });
  }
  return buildRoutes;
});

// cache(): a route page reads this for both its metadata and its content.
export const getRouteBySlug = cache(async (slug: string): Promise<RouteRow | null> => {
  if (IS_BUILD) return (await listActiveRoutes()).find((r) => r.slug === slug) ?? null;
  const rows = await sql<RouteRow[]>`
    SELECT * FROM routes WHERE slug = ${slug} AND is_active = true LIMIT 1
  `;
  return rows[0] ?? null;
});

// A null price is a real answer ("no cached fares for this route right now"),
// so it does overwrite the previous price.
export async function recordRoutePrice(params: {
  slug: string;
  cheapestPrice: number | null;
  cheapestCurrency: string;
  cheapestPriceUsd: number | null;
  cheapestDepartDate: string | null;
}): Promise<void> {
  const { slug, cheapestPrice, cheapestCurrency, cheapestPriceUsd, cheapestDepartDate } = params;
  await sql`
    UPDATE routes
    SET cheapest_price = ${cheapestPrice},
        cheapest_currency = ${cheapestCurrency},
        cheapest_price_usd = ${cheapestPriceUsd},
        cheapest_depart_date = ${cheapestDepartDate},
        last_refreshed_at = now(),
        refresh_status = 'ok',
        refresh_error = NULL,
        updated_at = now()
    WHERE slug = ${slug}
  `;
}

export async function recordRouteCalendar(slug: string, calendar: PriceCalendarData): Promise<void> {
  await sql`
    UPDATE routes
    SET price_calendar = ${sql.json(calendar as unknown as JSONValue)},
        updated_at = now()
    WHERE slug = ${slug}
  `;
}

export async function recordRouteFacts(slug: string, facts: RouteFacts): Promise<void> {
  await sql`
    UPDATE routes
    SET route_facts = ${sql.json(facts as unknown as JSONValue)},
        updated_at = now()
    WHERE slug = ${slug}
  `;
}

// Keeps the last good price and last_refreshed_at, so a Travelpayouts outage
// never blanks prices site-wide and the page's "last checked" date stays honest.
export async function recordRouteRefreshError(slug: string, error: string): Promise<void> {
  await sql`
    UPDATE routes
    SET refresh_status = 'error',
        refresh_error = ${error.slice(0, 1000)},
        updated_at = now()
    WHERE slug = ${slug}
  `;
}
