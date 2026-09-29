import Link from "next/link";
import { AirplaneInFlight, ArrowRight } from "@phosphor-icons/react/ssr";
import { formatPrice, formatShortDate } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./RouteTicket.module.css";

export default function RouteTicket({ route }: { route: RouteRow }) {
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const date = formatShortDate(route.cheapest_depart_date);

  return (
    <Link href={`/flights/${route.slug}`} className={styles.ticket}>
      <span className={styles.srOnly}>
        Flights from {route.origin_city} to {route.destination_city}
        {price ? `, from ${price}` : ""}
      </span>

      <div className={styles.top} aria-hidden="true">
        <div className={styles.end}>
          <span className={styles.code}>{route.origin_iata.trim()}</span>
          <span className={styles.city}>{route.origin_city}</span>
        </div>
        <div className={styles.path}>
          <AirplaneInFlight size={20} weight="duotone" />
        </div>
        <div className={`${styles.end} ${styles.right}`}>
          <span className={styles.code}>{route.destination_iata.trim()}</span>
          <span className={styles.city}>{route.destination_city}</span>
        </div>
      </div>

      <div className={styles.bottom} aria-hidden="true">
        {price ? (
          <div>
            <span className={styles.label}>One-way from</span>
            <span className={styles.price}>{price}</span>
          </div>
        ) : (
          <div>
            <span className={styles.label}>Fares</span>
            <span className={styles.pending}>Checking prices</span>
          </div>
        )}
        <div className={styles.meta}>
          {price && date && <span className={styles.date}>{date}</span>}
          <span className={styles.go}>
            <ArrowRight size={18} weight="bold" />
          </span>
        </div>
      </div>
    </Link>
  );
}
