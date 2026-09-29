import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { formatLongDate, formatPrice } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./OfferCard.module.css";

const PALETTES = [styles.ocean, styles.teal, styles.sunset];

// Promo-style card for a real cached fare. Only shows data we actually have.
export default function OfferCard({ route, index, badge }: { route: RouteRow; index: number; badge: string }) {
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const departs = formatLongDate(route.cheapest_depart_date);
  const destination = route.destination_iata.trim();

  return (
    <Link href={`/flights/${route.slug}`} className={`${styles.card} ${PALETTES[index % PALETTES.length]}`}>
      <span className={styles.watermark} aria-hidden="true">
        {destination}
      </span>
      <div>
        <span className={styles.badge}>{badge}</span>
        <h3 className={styles.route}>
          {route.origin_city} to {route.destination_city}
        </h3>
        <p className={styles.codes}>
          {route.origin_iata.trim()} to {destination}
        </p>
      </div>
      <div className={styles.bottom}>
        <div>
          <span className={styles.from}>One-way from</span>
          <span className={styles.price}>{price}</span>
          {departs && <span className={styles.date}>Departs {departs}</span>}
        </div>
        <span className={styles.cta}>
          View deal
          <ArrowRight size={16} weight="bold" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
