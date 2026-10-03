import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const url = process.env.DATABASE_URL;
const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);

// Use Supabase's transaction pooler (port 6543): the session pooler caps total
// clients (15 on small plans), which parallel build workers and the cron exhaust.
// Transaction mode doesn't support prepared statements (prepare: false), and even
// one pipelined query can stall there, so pipelining is off (max_pipeline: 0, a
// runtime option postgres.js's types omit). That also disables sql.begin(): make
// multi-step writes a single statement or a multi-statement unsafe() query instead.
const options = {
  ssl: isLocal ? false : ("require" as const),
  max: 5,
  idle_timeout: 20,
  // Generous: from slower networks a new pooler connection can take a few seconds.
  connect_timeout: 30,
  prepare: false,
  max_pipeline: 0,
  onnotice: () => {},
};
const sql = postgres(url, options);

export default sql;
