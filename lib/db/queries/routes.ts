import sql from "@/lib/db/client";
import type { RouteRow } from "@/lib/db/schema";

export async function listActiveRoutes(): Promise<RouteRow[]> {
  return sql<RouteRow[]>`
    SELECT * FROM routes WHERE is_active = true ORDER BY slug
  `;
}

export async function getRouteBySlug(slug: string): Promise<RouteRow | null> {
  const rows = await sql<RouteRow[]>`
    SELECT * FROM routes WHERE slug = ${slug} AND is_active = true LIMIT 1
  `;
  return rows[0] ?? null;
}

// A null price is a real answer ("no cached fares for this route right now"),
// so it does overwrite the previous price.
export async function recordRoutePrice(params: {
  slug: string;
  cheapestPrice: number | null;
  cheapestCurrency: string;
  cheapestDepartDate: string | null;
}): Promise<void> {
  const { slug, cheapestPrice, cheapestCurrency, cheapestDepartDate } = params;
  await sql`
    UPDATE routes
    SET cheapest_price = ${cheapestPrice},
        cheapest_currency = ${cheapestCurrency},
        cheapest_depart_date = ${cheapestDepartDate},
        last_refreshed_at = now(),
        refresh_status = 'ok',
        refresh_error = NULL,
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
