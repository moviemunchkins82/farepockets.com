// Row shapes matching db/migrations/*.sql. No ORM — raw SQL via lib/db/client.ts,
// these types just keep query call sites honest.

export interface RouteRow {
  id: number;
  slug: string;
  origin_iata: string;
  destination_iata: string;
  origin_city: string;
  destination_city: string;
  // ISO 3166-1 alpha-2, e.g. "US", "GB" (0003_route_markets.sql).
  origin_country: string;
  destination_country: string;
  // Pricing currency for this route (the origin market's), e.g. "USD", "GBP".
  currency: string;
  is_active: boolean;
  target_keyword: string | null;
  cheapest_price: string | null; // postgres.js returns NUMERIC as string, DATE/TIMESTAMPTZ as Date
  cheapest_currency: string;
  // Same fare in USD, for ranking routes priced in different currencies. Never displayed.
  cheapest_price_usd: string | null;
  cheapest_depart_date: Date | null;
  price_calendar: unknown | null;
  last_refreshed_at: Date | null;
  refresh_status: "pending" | "ok" | "stale" | "error";
  refresh_error: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ClickEventRow {
  id: number;
  occurred_at: Date;
  route_slug: string | null;
  page_path: string;
  marker: string;
  sub_id: string;
  target_url: string;
  session_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}
