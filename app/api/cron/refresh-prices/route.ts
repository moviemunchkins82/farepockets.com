import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/auth/cronSecret";
import { refreshAllRoutePrices } from "@/lib/travelpayouts/refresh";
import { revalidateRoutePages } from "@/lib/revalidate";

// Manual/admin trigger fallback — the primary refresh mechanism is
// scripts/refresh-prices.ts run directly by Hostinger's hPanel crontab.
export async function POST(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await refreshAllRoutePrices();
  revalidateRoutePages(results.filter((r) => r.status === "ok").map((r) => r.slug));
  return NextResponse.json({ results });
}
