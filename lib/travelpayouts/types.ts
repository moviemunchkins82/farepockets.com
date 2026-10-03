export interface CheapestPriceResult {
  origin: string;
  destination: string;
  price: number;
  currency: string;
  departDate: string | null;
  airline: string | null;
  transfers: number | null;
}

export interface PriceCalendarDay {
  date: string;
  price: number;
}

export interface PriceCalendarResult {
  origin: string;
  destination: string;
  days: PriceCalendarDay[];
}

// Stored in routes.price_calendar: cheapest cached fare per departure day, by month.
export interface PriceCalendarData {
  updatedAt: string;
  months: { month: string; days: PriceCalendarDay[] }[];
}

export function isPriceCalendarData(value: unknown): value is PriceCalendarData {
  const v = value as PriceCalendarData | null;
  return (
    !!v &&
    typeof v.updatedAt === "string" &&
    Array.isArray(v.months) &&
    v.months.every((m) => typeof m.month === "string" && Array.isArray(m.days))
  );
}

export interface FactAirport {
  code: string;
  name: string;
}

// Stored in routes.route_facts: what the cheapest fares on a route look like.
// Built from the same searches as the prices (lib/travelpayouts/refresh.ts).
export interface RouteFacts {
  updatedAt: string;
  // How many of the cheapest fares the stops/airlines/airports figures are based on.
  sampleSize: number;
  // e.g. [{ stops: 0, count: 20 }, { stops: 1, count: 10 }], fewest stops first.
  stops: { stops: number; count: number }[];
  // Airline names on the cheapest fares, most common first.
  airlines: string[];
  // Airports the cheapest fares use, most common first (useful for metro codes like LON).
  originAirports: (FactAirport & { count: number })[];
  destinationAirports: (FactAirport & { count: number })[];
  // Cheapest nonstop fare, or null if recent searches found none.
  nonstop: {
    price: number;
    count: number;
    airline: string | null;
    origin: FactAirport;
    destination: FactAirport;
    durationMinutes: number | null;
  } | null;
}

export function isRouteFacts(value: unknown): value is RouteFacts {
  const v = value as RouteFacts | null;
  return !!v && typeof v.updatedAt === "string" && typeof v.sampleSize === "number" && Array.isArray(v.stops) && Array.isArray(v.airlines);
}
