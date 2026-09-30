import Image from "next/image";
import Link from "next/link";
import { getCityImage } from "@/lib/cityImages";
import { hubPath, type CityHub } from "@/lib/cities";
import { formatPrice } from "@/lib/format";
import styles from "./DestinationTile.module.css";

export default function DestinationTile({ hub }: { hub: CityHub }) {
  const photo = getCityImage(hub.name);
  const price = hub.cheapest && formatPrice(hub.cheapest.cheapest_price, hub.cheapest.cheapest_currency);

  return (
    <Link href={hubPath("to", hub.name)} className={styles.tile}>
      <span className={styles.thumb} aria-hidden="true">
        {photo ? (
          <Image src={photo.src} alt="" fill sizes="64px" placeholder="blur" className={styles.img} />
        ) : (
          <span className={styles.code}>{hub.code}</span>
        )}
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{hub.name}</span>
        <span className={styles.meta}>{price ? `Flights from ${price}` : "Checking fares"}</span>
      </span>
    </Link>
  );
}
