// Single source of truth for every outbound affiliate URL / widget src.
// Every click and every widget instance MUST go through here so marker +
// sub_id are never hand-built inline on a page.
//
// TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE and TRAVELPAYOUTS_DEEPLINK_TEMPLATE are
// account-specific — copy the exact widget script src / link format from the
// Travelpayouts dashboard, then swap in {marker}, {subId}, {origin},
// {destination} placeholders (see .env.example).
//
// Until those are configured these return "#" and warn, so local dev isn't
// blocked before the account is approved — but a real launch
// (NEXT_PUBLIC_ALLOW_INDEXING=true) throws, so missing config can never ship live.

import type { RouteRow } from "@/lib/db/schema";

const ALLOW_INDEXING =process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
const PLACEHOLDER = "#";

function missingConfig(name: string): typeof PLACEHOLDER {
  const message = `${name} is not set — get the exact value from the Travelpayouts dashboard.`;
  if (ALLOW_INDEXING) throw new Error(message);
  console.warn(`[affiliateLinks] ${message} Using "#" placeholder for local dev.`);
  return PLACEHOLDER;
}

function fill(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, encodeURIComponent(value));
  }
  const leftover = result.match(/\{[a-zA-Z]+\}/);
  if (leftover) throw new Error(`Affiliate template has an unknown placeholder ${leftover[0]}`);
  return result;
}

// sub_id must be stable and page-identifiable, e.g. "route-nyc-to-lax", "search-widget".
export function buildSubId(context: string): string {
  return context
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function buildWidgetSrc(subId: string): string {
  const template = process.env.TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE;
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  if (!template) return missingConfig("TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE");
  if (!marker) return missingConfig("TRAVELPAYOUTS_MARKER");
  return fill(template, { marker, subId });
}

const DAY_MS = 86_400_000;
const FALLBACK_DAYS_AHEAD = 30;

// Aviasales search URLs carry the departure date as DDMM with no year, so only
// use the cached cheapest date while it's still at least a day out and within a year.
export function pickSearchDate(cheapestDepartDate: Date | null, now = new Date()): Date {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (cheapestDepartDate) {
    const t = cheapestDepartDate.getTime();
    if (t >= today + DAY_MS && t < today + 330 * DAY_MS) return cheapestDepartDate;
  }
  return new Date(today + FALLBACK_DAYS_AHEAD * DAY_MS);
}

function toDdMm(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return dd + mm;
}

export function buildDeepLink(
  originIata: string,
  destinationIata: string,
  subId: string,
  departDate: Date,
): string {
  const template = process.env.TRAVELPAYOUTS_DEEPLINK_TEMPLATE;
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  if (!template) return missingConfig("TRAVELPAYOUTS_DEEPLINK_TEMPLATE");
  if (!marker) return missingConfig("TRAVELPAYOUTS_MARKER");
  return fill(template, {
    marker,
    subId,
    origin: originIata.trim(),
    destination: destinationIata.trim(),
    date: toDdMm(departDate),
  });
}

// Same partner link as buildDeepLink, but landing on the Aviasales home page
// (for places with no specific route). Reuses the deep-link template with its
// u= target swapped, so marker/campaign/trs stay in one place.
export function buildPartnerHomeLink(subId: string): string {
  const template = process.env.TRAVELPAYOUTS_DEEPLINK_TEMPLATE;
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  if (!template) return missingConfig("TRAVELPAYOUTS_DEEPLINK_TEMPLATE");
  if (!marker) return missingConfig("TRAVELPAYOUTS_MARKER");
  if (!/[?&]u=[^&]*/.test(template)) throw new Error("TRAVELPAYOUTS_DEEPLINK_TEMPLATE has no u= target to replace");
  const home = template.replace(/([?&]u=)[^&]*/, (_, prefix: string) => prefix + encodeURIComponent("https://www.aviasales.com"));
  return fill(home, { marker, subId });
}

export interface WidgetFallback {
  href: string;
  subId: string;
  routeSlug: string | null;
}

// Link shown in place of the search widget if it fails to load (blocked or too
// slow). Its own "-fallback" sub ID shows in reports how often that happens.
export function buildWidgetFallback(
  widgetSubId: string,
  route?: Pick<RouteRow, "slug" | "origin_iata" | "destination_iata" | "cheapest_depart_date">,
): WidgetFallback {
  const subId = buildSubId(`${widgetSubId}_fallback`);
  if (!route) return { href: buildPartnerHomeLink(subId), subId, routeSlug: null };
  return {
    href: buildDeepLink(route.origin_iata, route.destination_iata, subId, pickSearchDate(route.cheapest_depart_date)),
    subId,
    routeSlug: route.slug,
  };
}

export function isPlaceholderLink(href: string): boolean {
  return href === PLACEHOLDER;
}
