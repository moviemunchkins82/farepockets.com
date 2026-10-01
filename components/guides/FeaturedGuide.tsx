import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText } from "@phosphor-icons/react/ssr";
import { getCityImage } from "@/lib/cityImages";
import { formatDate } from "@/lib/format";
import type { GuideSummary } from "@/lib/content/guides";
import styles from "./FeaturedGuide.module.css";

// The newest guide, shown large at the top of /guides.
export default function FeaturedGuide({ guide }: { guide: GuideSummary }) {
  const photo = guide.image ? getCityImage(guide.image) : null;
  const date = formatDate(guide.publishedAt);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            preload
            placeholder="blur"
            sizes="(max-width: 899px) 100vw, 620px"
            className={styles.img}
          />
        ) : (
          <BookOpenText size={56} weight="duotone" aria-hidden="true" />
        )}
      </div>
      <div className={styles.body}>
        {guide.category && <p className={styles.kicker}>{guide.category}</p>}
        <h2 className={styles.title}>
          <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
        </h2>
        <p className={styles.excerpt}>{guide.description}</p>
        <p className={styles.meta}>
          <span className={styles.author}>by {guide.author}</span>
          {date && <time dateTime={guide.publishedAt}>{date}</time>}
          <span>{guide.readingMinutes} min read</span>
        </p>
        <Link href={`/guides/${guide.slug}`} className={styles.button} aria-hidden="true" tabIndex={-1}>
          Read guide
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </article>
  );
}
