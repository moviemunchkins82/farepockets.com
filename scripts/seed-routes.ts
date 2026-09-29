// Reads data/routes.csv and upserts it into the routes table. Run: npm run seed:routes
// Routes removed from the CSV are deactivated (not deleted), so their pages 404
// and drop out of the sitemap while click history stays intact.
import "./_env";
import fs from "node:fs";
import path from "node:path";
import sql from "@/lib/db/client";
import { isValidSlug } from "@/lib/slug";

interface CsvRow {
  slug: string;
  origin_iata: string;
  destination_iata: string;
  origin_city: string;
  destination_city: string;
  target_keyword: string;
}

const REQUIRED_COLUMNS: (keyof CsvRow)[] = [
  "slug",
  "origin_iata",
  "destination_iata",
  "origin_city",
  "destination_city",
  "target_keyword",
];
const IATA = /^[A-Z]{3}$/;

function parseCsv(raw: string): CsvRow[] {
  const [headerLine, ...lines] = raw.replace(/\r/g, "").trim().split("\n");
  const headers = headerLine.split(",").map((h) => h.trim());
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) throw new Error(`routes.csv is missing columns: ${missing.join(", ")}`);

  const rows: CsvRow[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  lines.forEach((line, index) => {
    if (line.trim().length === 0) return;
    const lineNo = index + 2;
    const values = line.split(",").map((v) => v.trim());
    if (values.length !== headers.length) {
      errors.push(`line ${lineNo}: expected ${headers.length} values, got ${values.length} (commas inside values aren't supported)`);
      return;
    }
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i]])) as unknown as CsvRow;

    if (!isValidSlug(row.slug)) errors.push(`line ${lineNo}: invalid slug "${row.slug}" (lowercase letters, digits, hyphens)`);
    if (!IATA.test(row.origin_iata)) errors.push(`line ${lineNo}: invalid origin_iata "${row.origin_iata}"`);
    if (!IATA.test(row.destination_iata)) errors.push(`line ${lineNo}: invalid destination_iata "${row.destination_iata}"`);
    if (row.origin_iata === row.destination_iata) errors.push(`line ${lineNo}: origin and destination are the same`);
    if (!row.origin_city || !row.destination_city) errors.push(`line ${lineNo}: city names are required`);
    if (seen.has(row.slug)) errors.push(`line ${lineNo}: duplicate slug "${row.slug}"`);
    seen.add(row.slug);

    rows.push(row);
  });

  if (errors.length > 0) throw new Error(`routes.csv has errors:\n  ${errors.join("\n  ")}`);
  return rows;
}

async function main() {
  const csvPath = path.join(process.cwd(), "data", "routes.csv");
  const rows = parseCsv(fs.readFileSync(csvPath, "utf-8"));

  console.log(`Seeding ${rows.length} routes from ${csvPath}...`);

  const col = (key: keyof CsvRow) => rows.map((r) => r[key]);
  const slugs = col("slug");

  // One statement, so the upsert and the deactivation apply atomically.
  const [result] = await sql<{ upserted: number; deactivated: string[] }[]>`
    WITH input AS (
      SELECT * FROM unnest(
        ${slugs}::text[], ${col("origin_iata")}::text[], ${col("destination_iata")}::text[],
        ${col("origin_city")}::text[], ${col("destination_city")}::text[], ${col("target_keyword")}::text[]
      ) AS t(slug, origin_iata, destination_iata, origin_city, destination_city, target_keyword)
    ), upserted AS (
      INSERT INTO routes (slug, origin_iata, destination_iata, origin_city, destination_city, target_keyword, is_active)
      SELECT slug, origin_iata, destination_iata, origin_city, destination_city, NULLIF(target_keyword, ''), true
      FROM input
      ON CONFLICT (slug) DO UPDATE SET
        origin_iata = EXCLUDED.origin_iata,
        destination_iata = EXCLUDED.destination_iata,
        origin_city = EXCLUDED.origin_city,
        destination_city = EXCLUDED.destination_city,
        target_keyword = EXCLUDED.target_keyword,
        is_active = true,
        updated_at = now()
      RETURNING slug
    ), deactivated AS (
      UPDATE routes SET is_active = false, updated_at = now()
      WHERE is_active = true AND slug <> ALL(${slugs}::text[])
      RETURNING slug
    )
    SELECT
      (SELECT count(*) FROM upserted)::int AS upserted,
      COALESCE((SELECT array_agg(slug ORDER BY slug) FROM deactivated), '{}') AS deactivated
  `;

  console.log(`Upserted ${result.upserted} routes.`);
  if (result.deactivated.length > 0) {
    console.log(`Deactivated ${result.deactivated.length} routes no longer in the CSV: ${result.deactivated.join(", ")}`);
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error("seed-routes.ts failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => sql.end({ timeout: 5 }));
