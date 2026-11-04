"use client";

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

// The one place outbound affiliate clicks get tracked, in GA4 + Mixpanel (once
// analytics are set up). Clicks and bookings per link are also in the
// Travelpayouts dashboard, by sub_id. The normal <a> navigation proceeds — no
// preventDefault, no blocking the click.
export default function AffiliateLink({ href, subId, routeSlug, children, className, ariaLabel }: AffiliateLinkProps) {
  function handleClick() {
    const pagePath = window.location.pathname;
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
