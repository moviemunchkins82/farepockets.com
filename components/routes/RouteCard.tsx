import Image from "next/image";
import Link from "next/link";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice, formatShortDate } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./RouteCard.module.css";

// Horizontal route card (photo, route, codes, date, price). `photoCity` picks which
// end of the route to picture, e.g. the origin on a "flights to Miami" page.
export default function RouteCard({ route, photoCity }: { route: RouteRow; photoCity?: string }) {
  const photo = getCityImage(photoCity ?? route.destination_city);
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const date = formatShortDate(route.cheapest_depart_date);

  return (
    <Link href={`/flights/${route.slug}`} className={styles.card}>
      <span className={styles.thumb}>
        {photo && <Image src={photo.src} alt="" fill sizes="120px" placeholder="blur" className={styles.img} />}
      </span>
      <span className={styles.info}>
        <span className={styles.route}>
          {route.origin_city} to {route.destination_city}
        </span>
        <span className={styles.meta}>
          {route.origin_iata.trim()} to {route.destination_iata.trim()}
          {date ? `, departs ${date}` : ""}
        </span>
        <span className={styles.bottom}>
          <span className={styles.price}>{price ? `From ${price}` : "Checking fares"}</span>
          <span className={styles.cta}>View deal</span>
        </span>
      </span>
    </Link>
  );
}
