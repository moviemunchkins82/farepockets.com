import Link from "next/link";
import styles from "./AffiliateDisclosure.module.css";

// Placed adjacent to every monetized link/widget (route pages, /search, home
// search) — not footer-only. FTC affiliate-disclosure requirement.
export default function AffiliateDisclosure({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <p role="note" className={`${styles.note} ${inverse ? styles.inverse : ""} ${className ?? ""}`}>
      We may earn a commission when you book through links on this page, at no extra cost to you.{" "}
      <Link href="/disclosure">Learn more</Link>.
    </p>
  );
}
