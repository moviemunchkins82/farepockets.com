import { listActiveRoutes, recordRoutePrice, recordRouteRefreshError } from "@/lib/db/queries/routes";
import { getCheapestPrice } from "@/lib/travelpayouts/dataApi";
import { sleep } from "@/lib/travelpayouts/client";

export interface RefreshResult {
  slug: string;
  status: "ok" | "error";
  error?: string;
}

// Shared by scripts/refresh-prices.ts (system crontab, the primary mechanism)
// and app/api/cron/refresh-prices/route.ts (manual/admin trigger fallback).
export async function refreshAllRoutePrices(): Promise<RefreshResult[]> {
  const routes = await listActiveRoutes();
  const results: RefreshResult[] = [];

  for (const route of routes) {
    try {
      const result = await getCheapestPrice(route.origin_iata.trim(), route.destination_iata.trim());
      await recordRoutePrice({
        slug: route.slug,
        cheapestPrice: result?.price ?? null,
        cheapestCurrency: result?.currency ?? "USD",
        cheapestDepartDate: result?.departDate ?? null,
      });
      results.push({ slug: route.slug, status: "ok" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await recordRouteRefreshError(route.slug, message);
      results.push({ slug: route.slug, status: "error", error: message });
    }

    await sleep(150); // ~6-7 req/sec, under the 10 req/sec Data API limit
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
