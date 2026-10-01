import Image from "next/image";
import Link from "next/link";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice, formatShortDate } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./RouteListItem.module.css";

export default function RouteListItem({ route }: { route: RouteRow }) {
  const photo = getCityImage(route.destination_city);
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const date = formatShortDate(route.cheapest_depart_date);

  return (
    <Link href={`/flights/${route.slug}`} className={styles.item}>
      <span className={styles.thumb}>
        {photo && <Image src={photo.src} alt="" fill sizes="96px" placeholder="blur" className={styles.img} />}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>
          {route.origin_city} to {route.destination_city}
        </span>
        <span className={styles.meta}>
          {route.origin_iata.trim()} to {route.destination_iata.trim()}
          {date ? `, ${date}` : ""}
        </span>
        <span className={styles.price}>{price ? `From ${price}` : "Checking fares"}</span>
      </span>
    </Link>
  );
}
