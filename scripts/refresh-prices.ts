// Fetches fresh fares for every route in data/routes.csv and saves them as
// data/prices.json. Pages pick the new prices up on the next build, so commit
// and push the file (or redeploy) afterwards. Run: npm run refresh:prices
import "./_env";
import fs from "node:fs";
import path from "node:path";
import { listRouteDefinitions } from "@/lib/routes/data";
import { refreshAllRoutePrices } from "@/lib/travelpayouts/refresh";
import type { PricesFile } from "@/lib/routes/types";

const PRICES_PATH = path.join(process.cwd(), "data", "prices.json");

async function main() {
  const previous: PricesFile = fs.existsSync(PRICES_PATH) ? JSON.parse(fs.readFileSync(PRICES_PATH, "utf-8")) : {};
  const { prices, results } = await refreshAllRoutePrices(listRouteDefinitions(), previous);

  // Written to a temporary file first, so an interrupted run can't leave a
  // half-written prices.json that breaks the build.
  const tmpPath = `${PRICES_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(prices, null, 2) + "\n");
  fs.renameSync(tmpPath, PRICES_PATH);

  const errors = results.filter((r) => r.status === "error");
  const partialErrors = results.filter((r) => r.calendar === "error" || r.facts === "error");
  console.log(
    `Refreshed ${results.length} routes, ${errors.length} errors, ${partialErrors.length} with calendar or facts errors.`,
  );
  for (const e of [...errors, ...partialErrors]) console.error(`  ${e.slug}: ${e.error}`);

  // 2, not 1: prices.json was still saved (failed routes keep their previous
  // prices), so the scheduled workflow commits it and only warns.
  if (errors.length > 0) process.exitCode = 2;
}

main().catch((err) => {
  console.error("refresh-prices.ts failed:", err);
  process.exitCode = 1;
});
