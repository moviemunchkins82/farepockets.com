// Applies db/migrations/*.sql in filename order, once each. Run: npm run db:migrate
import "./_env";
import fs from "node:fs";
import path from "node:path";
import sql from "@/lib/db/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY`;

  const applied = new Set((await sql<{ filename: string }[]>`SELECT filename FROM schema_migrations`).map((r) => r.filename));
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("No pending migrations.");
    return;
  }

  for (const file of pending) {
    if (!/^[\w.-]+\.sql$/.test(file)) throw new Error(`Unexpected migration filename: ${file}`);
    const body = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    // A multi-statement simple query runs as one implicit transaction, so the
    // migration and its schema_migrations row apply together or not at all.
    await sql.unsafe(`${body}\n;\nINSERT INTO schema_migrations (filename) VALUES ('${file}');`);
    console.log(`Applied ${file}`);
  }
}

main()
  .catch((err) => {
    console.error("migrate.ts failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => sql.end({ timeout: 5 }));
