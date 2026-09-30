import Link from "next/link";
import { ArrowRight, CalendarBlank } from "@phosphor-icons/react/ssr";
import { formatLongDate, formatPrice } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "@/components/route-page/PriceCard.module.css";

// Hub header card: the cheapest route in this hub, linking to its route page.
export default function HubFareCard({ route, label }: { route: RouteRow; label: string }) {
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const departs = formatLongDate(route.cheapest_depart_date);

  return (
    <section className={styles.card} aria-label={label}>
      <p className={styles.label}>{label}</p>
      <p className={styles.price}>{price}</p>
      <p className={styles.row}>
        {route.origin_city} to {route.destination_city}, one-way
      </p>
      {departs && (
        <p className={styles.row}>
          <CalendarBlank size={18} aria-hidden="true" />
          Departing {departs}
        </p>
      )}
      <Link href={`/flights/${route.slug}`} className={`button ${styles.cta}`}>
        View this route
        <ArrowRight size={18} weight="bold" aria-hidden="true" />
      </Link>
    </section>
  );
}
