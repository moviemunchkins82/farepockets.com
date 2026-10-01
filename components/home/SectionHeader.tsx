import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/ssr";
import styles from "./SectionHeader.module.css";

export default function SectionHeader({
  title,
  description,
  href,
  linkLabel = "View all",
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className={styles.head}>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {href && (
        <Link href={href} className={styles.link}>
          {linkLabel}
          <CaretRight size={14} weight="bold" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
