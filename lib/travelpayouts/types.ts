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
