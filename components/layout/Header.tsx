import Link from "next/link";
import Logo from "@/components/layout/Logo";
import MobileMenu, { type MenuDestination } from "@/components/layout/MobileMenu";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { buildHubs, hubPath } from "@/lib/cities";
import { formatPrice } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./Header.module.css";

async function loadRoutes(): Promise<RouteRow[]> {
  try {
    return await listActiveRoutes();
  } catch {
    return [];
  }
}

export default async function Header() {
  const routes = await loadRoutes();
  const destinations: MenuDestination[] = buildHubs(routes, "to")
    .slice(0, 6)
    .map((hub) => ({
      name: hub.name,
      href: hubPath("to", hub.name),
      price: hub.cheapest ? formatPrice(hub.cheapest.cheapest_price, hub.cheapest.cheapest_currency) : null,
    }));

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <nav className={styles.nav} aria-label="Main">
          <Link href="/destinations" className={styles.link}>
            Destinations
          </Link>
          <Link href="/flights" className={styles.link}>
            Deals
          </Link>
          <Link href="/guides" className={styles.link}>
            Guides
          </Link>
          <Link href="/search" className={`button ${styles.cta}`}>
            <span className={styles.ctaLong}>Search flights</span>
            <span className={styles.ctaShort}>Search</span>
          </Link>
          <MobileMenu destinations={destinations} />
        </nav>
      </div>
    </header>
  );
}
