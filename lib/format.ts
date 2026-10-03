// Postgres NUMERIC comes back from postgres.js as a string.
export function formatPrice(amount: string | number | null, currency = "USD"): string | null {
  if (amount === null) return null;
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.trim() || "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

// Dates are stored as calendar dates; format in UTC so the day never shifts.
function toDate(value: string | Date | null): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

// "Oct 21, 2026"
export function formatDate(value: string | Date | null): string | null {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date)
    : null;
}

// "Oct 21"
export function formatShortDate(value: string | Date | null): string | null {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date) : null;
}

// "Wed, Oct 21, 2026"
export function formatLongDate(value: string | Date | null): string | null {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)
    : null;
}

// "4h 55m", "45m", "12h"
export function formatDuration(minutes: number | null): string | null {
  if (minutes === null || !Number.isFinite(minutes) || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const STOP_WORDS = ["nonstop", "one stop", "two stops", "three stops"];

// "nonstop", "one stop", "two stops"...
export function formatStops(stops: number): string {
  return STOP_WORDS[stops] ?? `${stops} stops`;
}

// Airports whose short form would read as just the city.
const KEEP_FULL_AIRPORT_NAME = new Set(["Istanbul Airport"]);

// "London Gatwick Airport" -> "London Gatwick", "Newark Liberty International Airport" -> "Newark Liberty"
export function shortAirportName(name: string): string {
  if (KEEP_FULL_AIRPORT_NAME.has(name)) return name;
  return name.replace(/\s+(International\s+)?Airport$/i, "") || name;
}

// "A", "A and B", "A, B and C"
export function listNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
