const BASE_URL = "https://api.travelpayouts.com";

function requireToken(): string {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) throw new Error("TRAVELPAYOUTS_TOKEN is not set");
  return token;
}

// Data API is rate-limited to 10 req/sec and is meant to feed cached/static
// pages, not live page renders — every caller of this must run server-side
// (cron/scripts), never in a request-render path.
export async function travelpayoutsGet<T>(
  path: string,
  params: Record<string, string>,
  retries = 2,
): Promise<T> {
  const token = requireToken();
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        headers: { "X-Access-Token": token },
      });
      if (!res.ok) {
        throw new Error(`Travelpayouts ${path} responded ${res.status}: ${await res.text()}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(500 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
