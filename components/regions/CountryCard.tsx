import Image from "next/image";
import Link from "next/link";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice } from "@/lib/format";
import { countryHref, type CountryGroup } from "@/lib/regions";
import styles from "./CountryCard.module.css";

// Photo card for one country in the region: cheapest fare and its cities.
export default function CountryCard({ group, headingLevel = "h3" }: { group: CountryGroup; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const photo = getCityImage(group.info.photoCity);
  const price = group.cheapest ? formatPrice(group.cheapest.cheapest_price, group.cheapest.cheapest_currency) : null;
  const cities = group.cities.map((c) => c.name);

  return (
    <Link href={countryHref(group)} className={styles.card}>
      <span className={styles.media}>
        {photo && (
          <Image
            src={photo.src}
            alt=""
            fill
            placeholder="blur"
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px"
            className={styles.img}
          />
        )}
        <Heading className={styles.name}>{group.info.name}</Heading>
      </span>
      <span className={styles.body}>
        <span className={styles.cities}>{cities.join(", ")}</span>
        <span className={styles.footer}>
          <span className={styles.price}>{price ? `From ${price}` : "Checking fares"}</span>
          <span className={styles.routes}>
            {group.routes.length} {group.routes.length === 1 ? "route" : "routes"}
          </span>
        </span>
      </span>
    </Link>
  );
}
