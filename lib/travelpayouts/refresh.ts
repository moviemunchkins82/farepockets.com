import { listActiveRoutes, upsertRoutePrice } from "@/lib/db/queries/routes";
import { getCheapestPrice } from "@/lib/travelpayouts/dataApi";
import { sleep } from "@/lib/travelpayouts/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";

// Shared by scripts/refresh-prices.ts (system crontab, the primary mechanism)
// and app/api/cron/refresh-prices/route.ts (manual/admin trigger fallback).
// Iterates routes with a delay between calls — Travelpayouts Data API is
// rate-limited to 10 req/sec, this stays well under that even at MVP scale.
export async function refreshAllRoutePrices(): Promise<{ slug: string; status: "ok" | "error" }[]> {
  const routes = await listActiveRoutes();
  const results: { slug: string; status: "ok" | "error" }[] = [];

  for (const route of routes) {
    try {
      const result = await getCheapestPrice(route.origin_iata, route.destination_iata);
      await upsertRoutePrice({
        slug: route.slug,
        cheapestPrice: result?.price ?? null,
        cheapestCurrency: result?.currency ?? "USD",
        cheapestDepartDate: result?.departDate ?? null,
        priceCalendar: null,
        status: "ok",
      });
      results.push({ slug: route.slug, status: "ok" });

      if (process.env.CRON_SECRET) {
        fetch(`${SITE_URL}/api/revalidate`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-cron-secret": process.env.CRON_SECRET },
          body: JSON.stringify({ slug: route.slug }),
        }).catch(() => {});
      }
    } catch (err) {
      await upsertRoutePrice({
        slug: route.slug,
        cheapestPrice: null,
        cheapestCurrency: "USD",
        cheapestDepartDate: null,
        priceCalendar: null,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
      results.push({ slug: route.slug, status: "error" });
    }

    await sleep(150); // ~6-7 req/sec, under the 10 req/sec Data API limit
  }

  return results;
}
