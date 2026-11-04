"use client";

import type { OverridedMixpanel } from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
// Same rule as app/layout.tsx: analytics only on the public site.
const ENABLED = !!MIXPANEL_TOKEN && process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

let client: Promise<OverridedMixpanel> | null = null;

// The library (~100 KB) is only downloaded when Mixpanel is switched on, so
// pages don't pay for it otherwise.
function getMixpanel(): Promise<OverridedMixpanel> | null {
  if (!ENABLED) return null;
  client ??= import("mixpanel-browser").then(({ default: mixpanel }) => {
    mixpanel.init(MIXPANEL_TOKEN!, { track_pageview: true, persistence: "localStorage" });
    return mixpanel;
  });
  return client;
}

// Mirrors the same events fired to GA4 (see ga4.ts), with the anonymous
// session id as Mixpanel's distinct_id.
export function identifySession(sessionId: string): void {
  if (!sessionId) return;
  getMixpanel()?.then((mixpanel) => mixpanel.identify(sessionId));
}

export function trackAffiliateClick(params: { subId: string; routeSlug: string | null; pagePath: string }): void {
  getMixpanel()?.then((mixpanel) =>
    mixpanel.track("affiliate_click", {
      sub_id: params.subId,
      route_slug: params.routeSlug ?? undefined,
      page_path: params.pagePath,
    }),
  );
}
