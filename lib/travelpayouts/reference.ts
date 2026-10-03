// Airline and airport names from Travelpayouts' public reference data, used
// when building route facts at refresh time (never on page requests).
const AIRLINES_URL = "https://api.travelpayouts.com/data/en/airlines.json";
const AIRPORTS_URL = "https://api.travelpayouts.com/data/en/airports.json";

// Where the reference data's name is outdated or missing a character.
const AIRPORT_OVERRIDES: Record<string, string> = {
  IST: "Istanbul Airport",
  SAW: "Sabiha Gökçen Airport",
};

interface NamedEntry {
  code: string;
  name: string | null;
  name_translations?: { en?: string };
}

export interface ReferenceNames {
  airline(code: string | undefined): string | null;
  airport(code: string): string;
}

async function fetchNames(url: string): Promise<Map<string, string>> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const entries = (await res.json()) as NamedEntry[];
  const map = new Map<string, string>();
  for (const entry of entries) {
    const name = entry.name_translations?.en ?? entry.name;
    if (entry.code && name) map.set(entry.code, name);
  }
  return map;
}

// Falls back to bare codes if the reference data can't be loaded, so a failed
// download never blocks a price refresh.
export async function loadReferenceNames(): Promise<ReferenceNames> {
  const [airlines, airports] = await Promise.all([
    fetchNames(AIRLINES_URL).catch(() => new Map<string, string>()),
    fetchNames(AIRPORTS_URL).catch(() => new Map<string, string>()),
  ]);
  return {
    airline: (code) => (code ? (airlines.get(code) ?? null) : null),
    airport: (code) => AIRPORT_OVERRIDES[code] ?? airports.get(code) ?? code,
  };
}
