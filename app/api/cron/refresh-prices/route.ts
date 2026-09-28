import { NextResponse, type NextRequest } from "next/server";
import { refreshAllRoutePrices } from "@/lib/travelpayouts/refresh";

// Manual/admin trigger fallback — the primary refresh mechanism is
// scripts/refresh-prices.ts run directly by Hostinger's hPanel crontab.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await refreshAllRoutePrices();
  return NextResponse.json({ results });
}
