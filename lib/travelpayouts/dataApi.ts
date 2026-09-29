import { travelpayoutsGet } from "@/lib/travelpayouts/client";
import type { CheapestPriceResult, PriceCalendarResult, PriceCalendarDay } from "@/lib/travelpayouts/types";

// /aviasales/v3/prices_for_dates accepts city OR airport IATA codes (the legacy
// /v1/prices/* endpoints only accept city codes, which silently returns nothing
// for airport-based routes like JFK-LAX). Data is Aviasales' search cache.
interface V3Ticket {
  price: number;
  departure_at?: string;
  airline?: string;
  flight_number?: string | number;
  transfers?: number;
}

interface V3Response {
  success: boolean;
  data: V3Ticket[];
  currency?: string;
  error?: string;
}

async function pricesForDates(params: Record<string, string>): Promise<V3Ticket[]> {
  const res = await travelpayoutsGet<V3Response>("/aviasales/v3/prices_for_dates", {
    currency: "usd",
    one_way: "true",
    sorting: "price",
    ...params,
  });

  if (!res || res.success !== true || !Array.isArray(res.data)) {
    throw new Error(`Unexpected prices_for_dates response: ${JSON.stringify(res).slice(0, 300)}`);
  }
  for (const ticket of res.data) {
    if (typeof ticket.price !== "number" || !Number.isFinite(ticket.price)) {
      throw new Error(`prices_for_dates ticket missing numeric price: ${JSON.stringify(ticket).slice(0, 300)}`);
    }
  }
  return res.data;
}

export async function getCheapestPrice(origin: string, destination: string): Promise<CheapestPriceResult | null> {
  const tickets = await pricesForDates({ origin, destination, limit: "30" });
  if (tickets.length === 0) return null;

  const cheapest = tickets.reduce((min, cur) => (cur.price < min.price ? cur : min));

  return {
    origin,
    destination,
    price: cheapest.price,
    currency: "USD",
    departDate: cheapest.departure_at ? cheapest.departure_at.slice(0, 10) : null,
    airline: cheapest.airline ?? null,
    transfers: typeof cheapest.transfers === "number" ? cheapest.transfers : null,
  };
}

// Cheapest cached fare per departure day for one month. `departureMonth` is yyyy-mm.
export async function getPriceCalendar(
  origin: string,
  destination: string,
  departureMonth: string,
): Promise<PriceCalendarResult> {
  const tickets = await pricesForDates({
    origin,
    destination,
    departure_at: departureMonth,
    unique: "false",
    limit: "1000",
  });

  const byDay = new Map<string, number>();
  for (const ticket of tickets) {
    if (!ticket.departure_at) continue;
    const day = ticket.departure_at.slice(0, 10);
    const existing = byDay.get(day);
    if (existing === undefined || ticket.price < existing) byDay.set(day, ticket.price);
  }

  const days: PriceCalendarDay[] = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, price]) => ({ date, price }));

  return { origin, destination, days };
}
