// One-off manual sanity check against a couple of routes — validates the
// Travelpayouts Data API response shape before trusting the real cron
// (scripts/refresh-prices.ts) to run unattended. Run: npx tsx scripts/backfill-prices.ts
import "./_env";
import { getCheapestPrice } from "@/lib/travelpayouts/dataApi";

const SAMPLE_ROUTES: [string, string, string][] = [
  ["JFK", "LAX", "USD"],
  ["ORD", "MIA", "USD"],
  ["LON", "EDI", "GBP"],
];

async function main() {
  for (const [origin, destination, currency] of SAMPLE_ROUTES) {
    console.log(`Fetching ${origin} -> ${destination} (${currency})...`);
    const result = await getCheapestPrice(origin, destination, currency);
    console.log(result);
  }
}

main().catch((err) => {
  console.error("backfill-prices.ts failed:", err);
  process.exitCode = 1;
});
