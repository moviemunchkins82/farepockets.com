import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { BookOpenText } from "@phosphor-icons/react/ssr";
import { formatDate } from "@/lib/format";
import type { GuideSummary } from "@/lib/content/guides";
import styles from "./GuideCard.module.css";

// Blog-style card: photo, category, title, excerpt, author and date.
// The photo is passed in (not looked up) so this also renders inside client components.
export default function GuideCard({
  guide,
  photo,
  headingLevel = "h2",
}: {
  guide: GuideSummary;
  photo: StaticImageData | null;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const date = formatDate(guide.publishedAt);

  return (
    <article className={styles.card}>
      <Link href={`/guides/${guide.slug}`} className={styles.link}>
        <span className={styles.media} aria-hidden="true">
          {photo ? (
            <Image
              src={photo}
              alt=""
              fill
              placeholder="blur"
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px"
              className={styles.img}
            />
          ) : (
            <BookOpenText size={36} weight="duotone" />
          )}
        </span>
        {guide.category && <span className={styles.kicker}>{guide.category}</span>}
        <Heading className={styles.title}>{guide.title}</Heading>
        <span className={styles.excerpt}>{guide.description}</span>
      </Link>
      <p className={styles.meta}>
        <span className={styles.author}>by {guide.author}</span>
        {date && <time dateTime={guide.publishedAt}>{date}</time>}
      </p>
    </article>
  );
}
