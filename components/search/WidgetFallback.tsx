"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";
import AffiliateLink from "@/components/AffiliateLink";
import type { WidgetFallback as WidgetFallbackLink } from "@/lib/travelpayouts/affiliateLinks";
import styles from "./WidgetFallback.module.css";

// Shown in the widget's place when it's blocked or too slow, so the visitor
// can still search (and the booking is still attributed to us).
export default function WidgetFallback({ link }: { link: WidgetFallbackLink }) {
  const usable = link.href !== "#";
  return (
    <div className={styles.fallback} role="status">
      <p className={styles.text}>
        The search form didn&apos;t load.{usable && " You can search directly on Aviasales, our travel partner."}
      </p>
      {usable && (
        <AffiliateLink href={link.href} subId={link.subId} routeSlug={link.routeSlug} className={`button ${styles.cta}`}>
          Search flights on Aviasales
          <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
        </AffiliateLink>
      )}
    </div>
  );
}
