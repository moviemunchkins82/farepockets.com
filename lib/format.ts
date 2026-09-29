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
