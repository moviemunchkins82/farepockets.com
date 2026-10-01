import Image from "next/image";
import Link from "next/link";
import { BookOpenText } from "@phosphor-icons/react/ssr";
import { getCityImage } from "@/lib/cityImages";
import { formatDate } from "@/lib/format";
import type { Guide } from "@/lib/content/guides";
import styles from "./GuideGrid.module.css";

export default function GuideGrid({ guides }: { guides: Guide[] }) {
  return (
    <ul className={styles.grid}>
      {guides.map((guide) => {
        const thumb = guide.image ? getCityImage(guide.image) : null;
        const date = formatDate(guide.publishedAt);
        return (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`} className={styles.guide}>
              <span className={styles.thumb} aria-hidden="true">
                {thumb ? (
                  <Image src={thumb.src} alt="" fill sizes="160px" placeholder="blur" className={styles.img} />
                ) : (
                  <BookOpenText size={28} weight="duotone" />
                )}
              </span>
              <span className={styles.text}>
                <span className={styles.kicker}>{guide.category ?? "Guide"}</span>
                <span className={styles.title}>{guide.title}</span>
                <span className={styles.desc}>{guide.description}</span>
                {date && <span className={styles.date}>{date}</span>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
