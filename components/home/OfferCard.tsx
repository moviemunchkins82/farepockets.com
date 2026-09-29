import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { formatLongDate, formatPrice } from "@/lib/format";
import { getCityImage } from "@/lib/cityImages";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./OfferCard.module.css";

const PALETTES = [styles.ocean, styles.teal, styles.sunset];

// Promo-style card for a real cached fare, over a photo of the destination.
export default function OfferCard({ route, index, badge }: { route: RouteRow; index: number; badge: string }) {
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const departs = formatLongDate(route.cheapest_depart_date);
  const photo = getCityImage(route.destination_city);

  return (
    <Link href={`/flights/${route.slug}`} className={`${styles.card} ${PALETTES[index % PALETTES.length]}`}>
      {photo && (
        <Image
          src={photo.src}
          alt=""
          fill
          placeholder="blur"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px"
          className={styles.photo}
        />
      )}
      <span className={styles.badge}>{badge}</span>
      <div className={styles.body}>
        <h3 className={styles.route}>
          {route.origin_city} to {route.destination_city}
        </h3>
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
      </div>
    </Link>
  );
}
