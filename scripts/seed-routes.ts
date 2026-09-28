// Reads data/routes.csv (SEO team's deliverable — see plan's Task Split,
// SEO A) and upserts into the routes table. Run: npx tsx scripts/seed-routes.ts
//
// data/routes.csv currently holds a handful of placeholder routes so the rest
// of the app can be built/tested before the real 30-50 route list arrives —
// replace it, don't build around it.
import "./_env";
import fs from "node:fs";
import path from "node:path";
import sql from "@/lib/db/client";

interface CsvRow {
  slug: string;
  origin_iata: string;
  destination_iata: string;
  origin_city: string;
  destination_city: string;
  target_keyword: string;
}

function parseCsv(raw: string): CsvRow[] {
  const [headerLine, ...lines] = raw.trim().split("\n");
  const headers = headerLine.split(",").map((h) => h.trim());

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]));
      return row as unknown as CsvRow;
    });
}

async function main() {
  const csvPath = path.join(process.cwd(), "data", "routes.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCsv(raw);

  console.log(`Seeding ${rows.length} routes from ${csvPath}...`);

  for (const row of rows) {
    await sql`
      INSERT INTO routes (slug, origin_iata, destination_iata, origin_city, destination_city, target_keyword)
      VALUES (${row.slug}, ${row.origin_iata}, ${row.destination_iata}, ${row.origin_city}, ${row.destination_city}, ${row.target_keyword})
      ON CONFLICT (slug) DO UPDATE SET
        origin_iata = EXCLUDED.origin_iata,
        destination_iata = EXCLUDED.destination_iata,
        origin_city = EXCLUDED.origin_city,
        destination_city = EXCLUDED.destination_city,
        target_keyword = EXCLUDED.target_keyword,
        updated_at = now()
    `;
  }

  console.log("Done.");
  await sql.end();
}

main().catch((err) => {
  console.error("seed-routes.ts failed:", err);
  process.exitCode = 1;
});
