import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Single shared connection pool for the app + scripts.
const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
  max: 10,
});

export default sql;
