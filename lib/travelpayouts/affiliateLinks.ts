// Single source of truth for every outbound affiliate URL / widget src.
// Every click and every widget instance MUST go through here so marker +
// sub_id are never hand-built inline on a page.
//
// TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE and TRAVELPAYOUTS_DEEPLINK_TEMPLATE are
// account-specific — Travelpayouts issues the exact widget embed URL and
// deep-link format from your dashboard once the account/marker is approved.
// Do not guess the format; paste what the dashboard gives you into the env
// vars, using {marker}, {subId}, {origin}, {destination} as placeholders.
//
// Until those are configured, these functions return a "#" placeholder and
// warn loudly, so local dev/build isn't blocked before the Travelpayouts
// account is approved — but a real launch (ALLOW_INDEXING=true) throws
// instead, so a missing config can never ship live.

const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

function missingConfig(name: string): string {
  const message = `${name} is not set — get the exact value from the Travelpayouts dashboard after signup.`;
  if (ALLOW_INDEXING) throw new Error(message);
  console.warn(`[affiliateLinks] ${message} Using "#" placeholder for local dev.`);
  return "#";
}

function requireMarker(): string {
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  if (marker) return marker;
  return missingConfig("TRAVELPAYOUTS_MARKER") === "#" ? "MARKER_NOT_SET" : "";
}

// sub_id must be stable and page-identifiable, e.g. "route_nyc-lax", "search_widget", "guide_best-time-to-fly-nyc".
export function buildSubId(context: string): string {
  return context
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildWidgetSrc(subId: string): string {
  const template = process.env.TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE;
  if (!template) return missingConfig("TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE");
  return template.replace("{marker}", requireMarker()).replace("{subId}", subId);
}

export function buildDeepLink(originIata: string, destinationIata: string, subId: string): string {
  const template = process.env.TRAVELPAYOUTS_DEEPLINK_TEMPLATE;
  if (!template) return missingConfig("TRAVELPAYOUTS_DEEPLINK_TEMPLATE");
  return template
    .replace("{marker}", requireMarker())
    .replace("{subId}", subId)
    .replace("{origin}", originIata)
    .replace("{destination}", destinationIata);
}
