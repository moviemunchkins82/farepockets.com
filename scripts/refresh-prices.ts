// Run by Hostinger's hPanel crontab: `npm run refresh:prices`
import "./_env";
import sql from "@/lib/db/client";
import { refreshAllRoutePrices, requestRevalidation } from "@/lib/travelpayouts/refresh";
import { deleteOldClickEvents } from "@/lib/db/queries/clicks";

async function main() {
  const results = await refreshAllRoutePrices();
  const errors = results.filter((r) => r.status === "error");
  const okSlugs = results.filter((r) => r.status === "ok").map((r) => r.slug);

  const partialErrors = results.filter((r) => r.calendar === "error" || r.facts === "error");

  console.log(
    `Refreshed ${results.length} routes, ${errors.length} errors, ${partialErrors.length} with calendar or facts errors.`,
  );
  for (const e of [...errors, ...partialErrors]) console.error(`  ${e.slug}: ${e.error}`);

  if (okSlugs.length > 0) {
    try {
      await requestRevalidation(okSlugs);
    } catch (err) {
      console.error("Revalidation failed (prices are saved; pages refresh within the ISR window):", err);
      process.exitCode = 1;
    }
  }

  try {
    const removed = await deleteOldClickEvents();
    if (removed > 0) console.log(`Deleted ${removed} click events older than the retention period.`);
  } catch (err) {
    console.error("Click history cleanup failed:", err);
  }

  if (errors.length > 0) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error("refresh-prices.ts failed:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end({ timeout: 5 }));
