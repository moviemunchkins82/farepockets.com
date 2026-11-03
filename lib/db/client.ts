import { cache } from "react";
import postgres, { type Sql } from "postgres";

// Use Supabase's transaction pooler (port 6543): the session pooler caps total
// clients (15 on small plans), which parallel build workers and the cron exhaust.
// Transaction mode doesn't support prepared statements (prepare: false), and even
// one pipelined query can stall there, so pipelining is off (max_pipeline: 0, a
// runtime option postgres.js's types omit). That also disables sql.begin(): make
// multi-step writes a single statement or a multi-statement unsafe() query instead.
function createClient(max: number): Sql {
  // Read lazily: on Cloudflare Workers, env vars only exist once a request arrives.
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);
  const options = {
    ssl: isLocal ? false : ("require" as const),
    max,
    idle_timeout: 20,
    // Generous: from slower networks a new pooler connection can take a few seconds.
    connect_timeout: 30,
    prepare: false,
    max_pipeline: 0,
    onnotice: () => {},
  };
  return postgres(url, options);
}

// Cloudflare Workers can't reuse a connection across requests (doing so fails
// with "Cannot perform I/O on behalf of a different request"), so there each
// request gets its own client, shared within the request via cache(). Everywhere
// else (next start, builds, scripts) uses one pool.
const IS_WORKERS = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
let shared: Sql | null = null;
const perRequest = cache(() => createClient(1));

function current(): Sql {
  if (IS_WORKERS) return perRequest();
  shared ??= createClient(5);
  return shared;
}

// Behaves exactly like a postgres.js `sql` (tagged template, sql.json, sql.end...),
// resolving the right client on each use, so query files don't need to change.
const sql = new Proxy(function () {} as unknown as Sql, {
  apply: (_target, _this, args) => (current() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_target, prop) => {
    const client = current() as unknown as Record<PropertyKey, unknown>;
    const value = client[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
});

export default sql;
