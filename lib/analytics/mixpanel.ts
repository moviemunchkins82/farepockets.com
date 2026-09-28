"use client";

import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

function ensureInit(): boolean {
  if (!MIXPANEL_TOKEN) return false;
  if (!initialized) {
    mixpanel.init(MIXPANEL_TOKEN, { track_pageview: true, persistence: "localStorage" });
    initialized = true;
  }
  return true;
}

// Mirrors the same events fired to GA4 (see ga4.ts) — same session_id used as
// Mixpanel's distinct_id so a Mixpanel funnel correlates with click_events rows.
export function identifySession(sessionId: string): void {
  if (!ensureInit() || !sessionId) return;
  mixpanel.identify(sessionId);
}

export function trackAffiliateClick(params: { subId: string; routeSlug: string | null; pagePath: string }): void {
  if (!ensureInit()) return;
  mixpanel.track("affiliate_click", {
    sub_id: params.subId,
    route_slug: params.routeSlug ?? undefined,
    page_path: params.pagePath,
  });
}
