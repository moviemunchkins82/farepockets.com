// Row shapes matching db/migrations/0001_init.sql. No ORM — raw SQL via lib/db/client.ts,
// these types just keep query call sites honest.

export interface RouteRow {
  id: number;
  slug: string;
  origin_iata: string;
  destination_iata: string;
  origin_city: string;
  destination_city: string;
  is_active: boolean;
  target_keyword: string | null;
  cheapest_price: string | null; // numeric comes back as string from postgres.js
  cheapest_currency: string;
  cheapest_depart_date: string | null;
  price_calendar: unknown | null;
  last_refreshed_at: string | null;
  refresh_status: "pending" | "ok" | "stale" | "error";
  refresh_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClickEventRow {
  id: number;
  occurred_at: string;
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
