// Checks data/routes.csv and writes data/routes.json, which the site bundles
// (lib/routes/data.ts). Runs before every dev server and build, so editing the
// CSV is all it takes to add, change or remove a route; removed routes' pages
// 404 and drop out of the sitemap. Run by hand: npm run routes:build
import fs from "node:fs";
import path from "node:path";
import { isValidSlug } from "@/lib/slug";
import type { RouteDefinition } from "@/lib/routes/types";

interface CsvRow {
  slug: string;
  origin_iata: string;
  destination_iata: string;
  origin_city: string;
  destination_city: string;
  origin_country: string;
  destination_country: string;
  currency: string;
  target_keyword: string;
}

const REQUIRED_COLUMNS: (keyof CsvRow)[] = [
  "slug",
  "origin_iata",
  "destination_iata",
  "origin_city",
  "destination_city",
  "origin_country",
  "destination_country",
  "currency",
  "target_keyword",
];
const IATA = /^[A-Z]{3}$/;
const COUNTRY = /^[A-Z]{2}$/; // ISO 3166-1 alpha-2, e.g. US, GB
const CURRENCY = /^[A-Z]{3}$/; // ISO 4217, e.g. USD, GBP

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
    if (!COUNTRY.test(row.origin_country)) errors.push(`line ${lineNo}: invalid origin_country "${row.origin_country}"`);
    if (!COUNTRY.test(row.destination_country)) errors.push(`line ${lineNo}: invalid destination_country "${row.destination_country}"`);
    if (!CURRENCY.test(row.currency)) errors.push(`line ${lineNo}: invalid currency "${row.currency}"`);
    if (seen.has(row.slug)) errors.push(`line ${lineNo}: duplicate slug "${row.slug}"`);
    seen.add(row.slug);

    rows.push(row);
  });

  if (errors.length > 0) throw new Error(`routes.csv has errors:\n  ${errors.join("\n  ")}`);
  return rows;
}

function main() {
  const dataDir = path.join(process.cwd(), "data");
  const rows = parseCsv(fs.readFileSync(path.join(dataDir, "routes.csv"), "utf-8"));
  const routes: RouteDefinition[] = rows.map((r) => ({ ...r, target_keyword: r.target_keyword || null }));
  const json = JSON.stringify(routes, null, 2) + "\n";

  // Rewritten only on change, so the dev server doesn't reload for nothing.
  const outPath = path.join(dataDir, "routes.json");
  const previous = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf-8") : null;
  if (previous !== json) fs.writeFileSync(outPath, json);
  console.log(`routes.json: ${routes.length} routes${previous === json ? " (unchanged)" : ""}.`);
}

try {
  main();
} catch (err) {
  console.error("build-routes.ts failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
