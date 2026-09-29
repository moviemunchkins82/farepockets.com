import { ArrowSquareOut, CalendarBlank, ClockCounterClockwise } from "@phosphor-icons/react/ssr";
import AffiliateLink from "@/components/AffiliateLink";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import { buildDeepLink, buildSubId, pickSearchDate } from "@/lib/travelpayouts/affiliateLinks";
import { formatDate, formatLongDate, formatPrice, formatShortDate } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./PriceCard.module.css";

export default function PriceCard({ route }: { route: RouteRow }) {
  const subId = buildSubId(`route_${route.slug}`);
  const searchDate = pickSearchDate(route.cheapest_depart_date);
  const href = buildDeepLink(route.origin_iata, route.destination_iata, subId, searchDate);
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const checked = formatDate(route.last_refreshed_at);
  const usesCheapestDate =
    route.cheapest_depart_date !== null && route.cheapest_depart_date.getTime() === searchDate.getTime();

  return (
    <section className={styles.card} aria-label="Lowest fare">
      <p className={styles.label}>Lowest one-way fare</p>
      {price ? (
        <p className={styles.price}>{price}</p>
      ) : (
        <p className={styles.pending}>We&apos;re checking fares for this route.</p>
      )}

      {price && usesCheapestDate && (
        <p className={styles.row}>
          <CalendarBlank size={18} aria-hidden="true" />
          Departing {formatLongDate(searchDate)}
        </p>
      )}

      <AffiliateLink href={href} subId={subId} routeSlug={route.slug} className={`button ${styles.cta}`}>
        {price && usesCheapestDate ? `See flights on ${formatShortDate(searchDate)}` : "Search flights"}
        <ArrowSquareOut size={18} weight="bold" aria-hidden="true" />
      </AffiliateLink>

      {checked && (
        <p className={`${styles.row} ${styles.muted}`}>
          <ClockCounterClockwise size={16} aria-hidden="true" />
          Prices last checked {checked}
        </p>
      )}
      <AffiliateDisclosure className={styles.disclosure} />
    </section>
  );
}
