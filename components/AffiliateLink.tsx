"use client";

import { getSessionId } from "@/lib/analytics/session";
import { trackAffiliateClick as trackGa4 } from "@/lib/analytics/ga4";
import { trackAffiliateClick as trackMixpanel } from "@/lib/analytics/mixpanel";

interface AffiliateLinkProps {
  href: string;
  subId: string;
  routeSlug: string | null;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

// The one place outbound affiliate clicks get logged. Fires a beacon to
// /api/click (survives page unload) plus GA4 + Mixpanel, then lets the
// normal <a> navigation proceed — no preventDefault, no blocking the click.
export default function AffiliateLink({ href, subId, routeSlug, children, className, ariaLabel }: AffiliateLinkProps) {
  function handleClick() {
    const pagePath = window.location.pathname;
    const sessionId = getSessionId();

    const payload = JSON.stringify({
      routeSlug,
      pagePath,
      subId,
      targetUrl: href,
      sessionId,
      referrer: document.referrer || null,
      utmSource: new URLSearchParams(window.location.search).get("utm_source"),
      utmMedium: new URLSearchParams(window.location.search).get("utm_medium"),
      utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign"),
    });

    navigator.sendBeacon?.("/api/click", new Blob([payload], { type: "application/json" }));

    trackGa4({ subId, routeSlug, pagePath });
    trackMixpanel({ subId, routeSlug, pagePath });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
