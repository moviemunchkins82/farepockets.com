import Image from "next/image";
import Breadcrumbs from "@/components/route-page/Breadcrumbs";
import type { CityImage } from "@/lib/cityImages";
import styles from "./PhotoHero.module.css";

// Page header over a destination photo (dark overlay, white text), or a light
// gradient when the city has no photo yet. The aside sits in a white card column.
export default function PhotoHero({
  image,
  breadcrumbs,
  kicker,
  title,
  lead,
  aside,
}: {
  image: CityImage | null;
  breadcrumbs: { name: string; url: string }[];
  kicker?: React.ReactNode;
  title: string;
  lead: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className={`${styles.hero} ${image ? styles.withPhoto : ""}`}>
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          placeholder="blur"
          sizes="100vw"
          className={styles.image}
        />
      )}
      <div className={`container ${styles.inner}`}>
        <Breadcrumbs items={breadcrumbs} />
        <div className={`${styles.grid} ${aside ? "" : styles.single}`}>
          <div>
            {kicker && <div className={styles.kicker}>{kicker}</div>}
            <h1>{title}</h1>
            <p className={styles.lead}>{lead}</p>
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
