import Link from "next/link";
import Logo from "@/components/layout/Logo";
import styles from "./Footer.module.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo />
          <p>
            {SITE_NAME} helps you compare US flight prices. Bookings are made with our travel partner, which pays us a
            commission at no extra cost to you.
          </p>
        </div>

        <nav aria-label="Explore" className={styles.col}>
          <h2>Explore</h2>
          <Link href="/search">Search flights</Link>
          <Link href="/flights">Flight deals</Link>
          <Link href="/guides">Travel guides</Link>
        </nav>

        <nav aria-label="Company" className={styles.col}>
          <h2>Company</h2>
          <Link href="/disclosure">How we make money</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          &copy; {new Date().getFullYear()} {SITE_NAME}. Fares are cached and may change; confirm the final price before
          booking. City photos from{" "}
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">
            Unsplash
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
