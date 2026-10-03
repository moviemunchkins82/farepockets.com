import type { V3Ticket } from "@/lib/travelpayouts/dataApi";
import type { ReferenceNames } from "@/lib/travelpayouts/reference";
import type { RouteFacts } from "@/lib/travelpayouts/types";

const MAX_AIRLINES = 5;

// Most common first; ties keep the order of first appearance (cheaper fares first).
function tally(values: (string | undefined)[]): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
}

// Summarises the cheapest fares (and the cheapest nonstop ones) on a route.
export function buildRouteFacts(sample: V3Ticket[], nonstopSample: V3Ticket[], names: ReferenceNames): RouteFacts {
  const stops = tally(sample.map((t) => (typeof t.transfers === "number" ? String(t.transfers) : undefined)))
    .map(({ value, count }) => ({ stops: Number(value), count }))
    .sort((a, b) => a.stops - b.stops);

  const airlines: string[] = [];
  for (const { value } of tally(sample.map((t) => t.airline))) {
    const name = names.airline(value);
    if (name && !airlines.includes(name)) airlines.push(name);
    if (airlines.length === MAX_AIRLINES) break;
  }

  const airports = (codes: (string | undefined)[]) =>
    tally(codes).map(({ value, count }) => ({ code: value, name: names.airport(value), count }));

  const cheapestNonstop = [...nonstopSample].sort((a, b) => a.price - b.price)[0];

  return {
    updatedAt: new Date().toISOString(),
    sampleSize: sample.length,
    stops,
    airlines,
    originAirports: airports(sample.map((t) => t.origin_airport)),
    destinationAirports: airports(sample.map((t) => t.destination_airport)),
    nonstop:
      cheapestNonstop && cheapestNonstop.origin_airport && cheapestNonstop.destination_airport
        ? {
            price: cheapestNonstop.price,
            count: nonstopSample.length,
            airline: names.airline(cheapestNonstop.airline),
            origin: { code: cheapestNonstop.origin_airport, name: names.airport(cheapestNonstop.origin_airport) },
            destination: {
              code: cheapestNonstop.destination_airport,
              name: names.airport(cheapestNonstop.destination_airport),
            },
            durationMinutes: typeof cheapestNonstop.duration_to === "number" ? cheapestNonstop.duration_to : null,
          }
        : null,
  };
}
