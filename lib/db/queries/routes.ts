import type { JSONValue } from "postgres";
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

export async function upsertRoutePrice(params: {
  slug: string;
  cheapestPrice: number | null;
  cheapestCurrency: string;
  cheapestDepartDate: string | null;
  priceCalendar: JSONValue | null;
  status: "ok" | "error";
  error?: string;
}): Promise<void> {
  const { slug, cheapestPrice, cheapestCurrency, cheapestDepartDate, priceCalendar, status, error } = params;
  await sql`
    UPDATE routes
    SET cheapest_price = ${cheapestPrice},
        cheapest_currency = ${cheapestCurrency},
        cheapest_depart_date = ${cheapestDepartDate},
        price_calendar = ${priceCalendar === null ? null : sql.json(priceCalendar)},
        last_refreshed_at = now(),
        refresh_status = ${status},
        refresh_error = ${error ?? null},
        updated_at = now()
    WHERE slug = ${slug}
  `;
}
