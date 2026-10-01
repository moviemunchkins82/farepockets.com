import Image from "next/image";
import Link from "next/link";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice, formatShortDate } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./DealCard.module.css";

// Photo card for one route's cheapest cached fare.
export default function DealCard({ route }: { route: RouteRow }) {
  const photo = getCityImage(route.destination_city);
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const date = formatShortDate(route.cheapest_depart_date);

  return (
    <Link href={`/flights/${route.slug}`} className={styles.card}>
      <div className={styles.media}>
        {photo && (
          <Image
            src={photo.src}
            alt=""
            fill
            placeholder="blur"
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px"
            className={styles.img}
          />
        )}
        <h3 className={styles.title}>
          {route.origin_city} to {route.destination_city}
        </h3>
      </div>
      <div className={styles.footer}>
        <div>
          <span className={styles.price}>{price ? `From ${price}` : "Checking fares"}</span>
          {price && date && <span className={styles.meta}>One-way, departs {date}</span>}
        </div>
        <span className={styles.cta}>View deal</span>
      </div>
    </Link>
  );
}
