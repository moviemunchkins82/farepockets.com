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
