"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackAffiliateClick(params: { subId: string; routeSlug: string | null; pagePath: string }): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "affiliate_click", {
    sub_id: params.subId,
    route_slug: params.routeSlug ?? undefined,
    page_path: params.pagePath,
  });
}
