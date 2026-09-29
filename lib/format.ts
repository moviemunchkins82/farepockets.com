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
export function formatDate(value: string | Date | null): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}
