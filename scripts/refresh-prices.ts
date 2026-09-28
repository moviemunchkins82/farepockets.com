// Run directly by Hostinger's hPanel crontab: `npx tsx scripts/refresh-prices.ts`
// (tsx resolves the "@/*" tsconfig path alias natively — no extra config needed).
import "./_env";
import { refreshAllRoutePrices } from "@/lib/travelpayouts/refresh";

async function main() {
  const results = await refreshAllRoutePrices();
  const errors = results.filter((r) => r.status === "error");

  console.log(`Refreshed ${results.length} routes, ${errors.length} errors.`);
  if (errors.length > 0) {
    console.error("Failed slugs:", errors.map((e) => e.slug).join(", "));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("refresh-prices.ts failed:", err);
  process.exitCode = 1;
});
