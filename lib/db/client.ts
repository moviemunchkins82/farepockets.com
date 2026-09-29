import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const url = process.env.DATABASE_URL;
const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);

// prepare: false keeps this compatible with Supabase's transaction-mode pooler
// (port 6543), which doesn't support prepared statements.
const sql = postgres(url, {
  ssl: isLocal ? false : "require",
  max: 10,
  prepare: false,
  onnotice: () => {},
});

export default sql;
