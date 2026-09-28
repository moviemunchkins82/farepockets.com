import { travelpayoutsGet } from "@/lib/travelpayouts/client";
import type { CheapestPriceResult, PriceCalendarResult, PriceCalendarDay } from "@/lib/travelpayouts/types";

interface CheapPriceEntry {
  price: number;
  airline?: string;
  flight_number?: number;
  departure_at?: string;
  return_at?: string;
}

interface CheapPricesResponse {
  success: boolean;
  // data[destination][stopsCount] = cheapest entry for that number of stops
  data: Record<string, Record<string, CheapPriceEntry>>;
}

// /v1/prices/cheap — cheapest cached fares for a route, grouped by destination then stop count.
export async function getCheapestPrice(origin: string, destination: string): Promise<CheapestPriceResult | null> {
  const res = await travelpayoutsGet<CheapPricesResponse>("/v1/prices/cheap", {
    origin,
    destination,
    currency: "usd",
  });

  const byStops = res.data?.[destination];
  if (!byStops) return null;

  const entries = Object.values(byStops);
  if (entries.length === 0) return null;

  const cheapest = entries.reduce((min, cur) => (cur.price < min.price ? cur : min));

  return {
    origin,
    destination,
    price: cheapest.price,
    currency: "USD",
    departDate: cheapest.departure_at ?? null,
  };
}

interface CalendarResponse {
  success: boolean;
  data: Record<string, { price: number }>;
}

// /v1/prices/calendar — cheapest fare per day for a month. Used to render the
// price-calendar long-tail pages. `departureMonth` is yyyy-mm.
export async function getPriceCalendar(
  origin: string,
  destination: string,
  departureMonth: string,
): Promise<PriceCalendarResult> {
  const res = await travelpayoutsGet<CalendarResponse>("/v1/prices/calendar", {
    origin,
    destination,
    depart_date: departureMonth,
    calendar_type: "departure_date",
    currency: "usd",
  });

  const days: PriceCalendarDay[] = Object.entries(res.data ?? {}).map(([date, v]) => ({
    date,
    price: v.price,
  }));

  return { origin, destination, days };
}
