// A route as pages see it: its row from data/routes.csv plus its latest prices
// from data/prices.json, joined by lib/routes/data.ts.

export interface RouteRow {
  slug: string;
  origin_iata: string;
  destination_iata: string;
  origin_city: string;
  destination_city: string;
  // ISO 3166-1 alpha-2, e.g. "US", "GB".
  origin_country: string;
  destination_country: string;
  // Pricing currency for this route (the origin market's), e.g. "USD", "GBP".
  currency: string;
  target_keyword: string | null;
  cheapest_price: number | null;
  cheapest_currency: string;
  // Same fare in USD, for ranking routes priced in different currencies. Never displayed.
  cheapest_price_usd: number | null;
  cheapest_depart_date: Date | null;
  price_calendar: unknown | null; // PriceCalendarData (lib/travelpayouts/types.ts) once refreshed
  route_facts: unknown | null; // RouteFacts (lib/travelpayouts/types.ts) once refreshed
  last_refreshed_at: Date | null;
}

// One row of data/routes.csv (also data/routes.json, which scripts/build-routes.ts
// writes from it).
export interface RouteDefinition {
  slug: string;
  origin_iata: string;
  destination_iata: string;
  origin_city: string;
  destination_city: string;
  origin_country: string;
  destination_country: string;
  currency: string;
  target_keyword: string | null;
}

// One route's entry in data/prices.json, written by scripts/refresh-prices.ts.
// Dates are "yyyy-mm-dd" and timestamps ISO strings, since this is JSON.
export interface RoutePrices {
  cheapest_price: number | null;
  cheapest_currency: string;
  cheapest_price_usd: number | null;
  cheapest_depart_date: string | null;
  price_calendar: unknown | null;
  route_facts: unknown | null;
  last_refreshed_at: string;
}

export type PricesFile = Record<string, RoutePrices>;
