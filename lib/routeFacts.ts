import { formatDuration, formatPrice, formatStops } from "@/lib/format";
import { isRouteFacts, type RouteFacts } from "@/lib/travelpayouts/types";
import type { RouteRow } from "@/lib/db/schema";

// Plain-English summaries of a route's facts, shared by the "Good to know"
// panel and the FAQ so both always say the same thing.

export function routeFacts(route: RouteRow): RouteFacts | null {
  return isRouteFacts(route.route_facts) && route.route_facts.sampleSize > 0 ? route.route_facts : null;
}

export function nonstopSummary(route: RouteRow, facts: RouteFacts): string {
  const n = facts.nonstop;
  if (!n) return `We found no nonstop fares from ${route.origin_city} to ${route.destination_city} in recent searches.`;
  const price = formatPrice(n.price, route.currency);
  const duration = formatDuration(n.durationMinutes);
  return `Yes. The cheapest nonstop fare we found was ${price}${n.airline ? ` with ${n.airline}` : ""}, from ${n.origin.name} to ${n.destination.name}${
    duration ? `, a flight of about ${duration}` : ""
  }.`;
}

// The most common number of stops on the cheapest fares.
export function stopsSummary(facts: RouteFacts): { headline: string; detail: string } | null {
  if (facts.stops.length === 0) return null;
  const byCount = [...facts.stops].sort((a, b) => b.count - a.count);
  const [top, second] = byCount;
  const detail = facts.stops.map((s) => `${s.count} ${formatStops(s.stops)}`).join(", ");
  // "Mostly" only when one option clearly dominates; a near split says so.
  const dominant = !second || top.count / facts.sampleSize >= 0.6;
  const headline = dominant
    ? `Mostly ${formatStops(top.stops)}`
    : `Mix of ${[top, second]
        .sort((a, b) => a.stops - b.stops)
        .map((s) => formatStops(s.stops))
        .join(" and ")}`;
  return { headline, detail: `Of the ${facts.sampleSize} cheapest fares: ${detail}.` };
}
