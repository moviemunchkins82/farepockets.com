import {
  listActiveRoutes,
  recordRouteCalendar,
  recordRoutePrice,
  recordRouteRefreshError,
} from "@/lib/db/queries/routes";
import { getCheapestPrice, getPriceCalendar } from "@/lib/travelpayouts/dataApi";
import { sleep } from "@/lib/travelpayouts/client";
import type { PriceCalendarData } from "@/lib/travelpayouts/types";

export const CALENDAR_MONTHS = 3;
const REQUEST_GAP_MS = 150; // ~6-7 req/sec, under the 10 req/sec Data API limit

export interface RefreshResult {
  slug: string;
  status: "ok" | "error";
  calendar?: "ok" | "error";
  error?: string;
}

// "yyyy-mm" for the month containing tomorrow (UTC) and the following months.
export function upcomingMonths(count = CALENDAR_MONTHS, now = new Date()): string[] {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

async function fetchCalendar(origin: string, destination: string, currency: string): Promise<PriceCalendarData> {
  const months: PriceCalendarData["months"] = [];
  for (const month of upcomingMonths()) {
    const { days } = await getPriceCalendar(origin, destination, month, currency);
    months.push({ month, days });
    await sleep(REQUEST_GAP_MS);
  }
  return { updatedAt: new Date().toISOString(), months };
}

// Shared by scripts/refresh-prices.ts (system crontab, the primary mechanism)
// and app/api/cron/refresh-prices/route.ts (manual/admin trigger fallback).
export async function refreshAllRoutePrices(): Promise<RefreshResult[]> {
  const routes = await listActiveRoutes();
  const results: RefreshResult[] = [];

  for (const route of routes) {
    const origin = route.origin_iata.trim();
    const destination = route.destination_iata.trim();
    const currency = route.currency.trim();
    let result: RefreshResult;

    try {
      const cheapest = await getCheapestPrice(origin, destination, currency);
      let cheapestUsd = currency === "USD" ? (cheapest?.price ?? null) : null;
      if (cheapest && currency !== "USD") {
        // Only used to rank this route against USD-priced ones; a miss just ranks it last.
        await sleep(REQUEST_GAP_MS);
        try {
          cheapestUsd = (await getCheapestPrice(origin, destination, "USD"))?.price ?? null;
        } catch {
          cheapestUsd = null;
        }
      }
      await recordRoutePrice({
        slug: route.slug,
        cheapestPrice: cheapest?.price ?? null,
        cheapestCurrency: currency,
        cheapestPriceUsd: cheapestUsd,
        cheapestDepartDate: cheapest?.departDate ?? null,
      });
      result = { slug: route.slug, status: "ok" };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await recordRouteRefreshError(route.slug, message);
      results.push({ slug: route.slug, status: "error", error: message });
      await sleep(REQUEST_GAP_MS);
      continue;
    }
    await sleep(REQUEST_GAP_MS);

    // A failed calendar keeps the previous one; it doesn't fail the route.
    try {
      await recordRouteCalendar(route.slug, await fetchCalendar(origin, destination, currency));
      result.calendar = "ok";
    } catch (err) {
      result.calendar = "error";
      result.error = `calendar: ${err instanceof Error ? err.message : String(err)}`;
    }
    results.push(result);
  }

  return results;
}

// Asks the running site to drop its cached pages for these routes. Only needed
// from the standalone cron script — the API route revalidates in-process.
export async function requestRevalidation(slugs: string[]): Promise<void> {
  const siteUrl = process.env.REVALIDATE_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.CRON_SECRET;
  if (!siteUrl || !secret) {
    console.warn("[refresh] REVALIDATE_BASE_URL/NEXT_PUBLIC_SITE_URL or CRON_SECRET not set — skipping revalidation.");
    return;
  }

  const res = await fetch(new URL("/api/revalidate", siteUrl), {
    method: "POST",
    headers: { "content-type": "application/json", "x-cron-secret": secret },
    body: JSON.stringify({ slugs }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Revalidation request failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  }
}
