import Image from "next/image";
import Link from "next/link";
import { AirplaneTilt, CaretRight } from "@phosphor-icons/react/ssr";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice, formatShortDate } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./SidebarDeals.module.css";

// Compact list of cheap routes for the guide sidebar.
export default function SidebarDeals({ routes }: { routes: RouteRow[] }) {
  return (
    <section className={styles.deals} aria-labelledby="sidebar-deals">
      <h2 id="sidebar-deals" className={styles.heading}>
        Cheapest flights right now
      </h2>
      <ul className={styles.list}>
        {routes.map((route) => {
          const photo = getCityImage(route.destination_city);
          const price = formatPrice(route.cheapest_price, route.cheapest_currency);
          const date = formatShortDate(route.cheapest_depart_date);
          return (
            <li key={route.slug}>
              <Link href={`/flights/${route.slug}`} className={styles.deal}>
                <span className={styles.thumb} aria-hidden="true">
                  {photo ? (
                    <Image src={photo.src} alt="" fill sizes="64px" placeholder="blur" className={styles.img} />
                  ) : (
                    <AirplaneTilt size={22} weight="duotone" />
                  )}
                </span>
                <span className={styles.text}>
                  <span className={styles.route}>
                    {route.origin_city} to {route.destination_city}
                  </span>
                  {date && <span className={styles.meta}>One-way, departs {date}</span>}
                </span>
                {price && <span className={styles.price}>{price}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/flights" className={styles.all}>
        See all flight deals
        <CaretRight size={14} weight="bold" aria-hidden="true" />
      </Link>
    </section>
  );
}
