import Link from "next/link";
import Logo from "@/components/layout/Logo";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <nav className={styles.nav} aria-label="Main">
          <Link href="/flights" className={`${styles.link} ${styles.optional}`}>
            Deals
          </Link>
          <Link href="/guides" className={styles.link}>
            Guides
          </Link>
          <Link href="/search" className={`button ${styles.cta}`}>
            Search flights
          </Link>
        </nav>
      </div>
    </header>
  );
}
