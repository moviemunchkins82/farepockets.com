import { cheapestFromSample, getCheapestPrice, getFareSample, getPriceCalendar } from "@/lib/travelpayouts/dataApi";
import { loadReferenceNames } from "@/lib/travelpayouts/reference";
import { buildRouteFacts } from "@/lib/travelpayouts/routeFacts";
import { sleep } from "@/lib/travelpayouts/client";
import type { PriceCalendarData } from "@/lib/travelpayouts/types";
import type { PricesFile, RouteDefinition } from "@/lib/routes/types";

export const CALENDAR_MONTHS = 3;
const REQUEST_GAP_MS = 150; // ~6-7 req/sec, under the 10 req/sec Data API limit

export interface RefreshResult {
  slug: string;
  status: "ok" | "error";
  calendar?: "ok" | "error";
  facts?: "ok" | "error";
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

// Run by scripts/refresh-prices.ts, which saves the result as data/prices.json.
// A route whose price lookup fails keeps its previous entry, so a Travelpayouts
// outage never blanks prices site-wide and the "last checked" date stays honest;
// a failed calendar or facts lookup likewise keeps the previous calendar or facts.
export async function refreshAllRoutePrices(
  routes: RouteDefinition[],
  previous: PricesFile,
): Promise<{ prices: PricesFile; results: RefreshResult[] }> {
  const names = await loadReferenceNames();
  const prices: PricesFile = {};
  const results: RefreshResult[] = [];

  for (const route of routes) {
    const origin = route.origin_iata.trim();
    const destination = route.destination_iata.trim();
    const currency = route.currency.trim();
    const old = previous[route.slug];
    let result: RefreshResult;

    let sample: Awaited<ReturnType<typeof getFareSample>> = [];
    try {
      sample = await getFareSample(origin, destination, currency);
      const cheapest = cheapestFromSample(origin, destination, currency, sample);
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
      // A null price is a real answer ("no cached fares for this route right
      // now"), so it does replace the previous price.
      prices[route.slug] = {
        cheapest_price: cheapest?.price ?? null,
        cheapest_currency: currency,
        cheapest_price_usd: cheapestUsd,
        cheapest_depart_date: cheapest?.departDate ?? null,
        price_calendar: old?.price_calendar ?? null,
        route_facts: old?.route_facts ?? null,
        last_refreshed_at: new Date().toISOString(),
      };
      result = { slug: route.slug, status: "ok" };
    } catch (err) {
      if (old) prices[route.slug] = old;
      results.push({ slug: route.slug, status: "error", error: err instanceof Error ? err.message : String(err) });
      await sleep(REQUEST_GAP_MS);
      continue;
    }
    await sleep(REQUEST_GAP_MS);
    const entry = prices[route.slug];

    try {
      entry.price_calendar = await fetchCalendar(origin, destination, currency);
      result.calendar = "ok";
    } catch (err) {
      result.calendar = "error";
      result.error = `calendar: ${err instanceof Error ? err.message : String(err)}`;
    }

    // Facts: nonstop flights, airlines, stops.
    try {
      const nonstopSample = await getFareSample(origin, destination, currency, true);
      entry.route_facts = buildRouteFacts(sample, nonstopSample, names);
      result.facts = "ok";
    } catch (err) {
      result.facts = "error";
      result.error = [result.error, `facts: ${err instanceof Error ? err.message : String(err)}`].filter(Boolean).join("; ");
    }
    await sleep(REQUEST_GAP_MS);
    results.push(result);
  }

  return { prices, results };
}
