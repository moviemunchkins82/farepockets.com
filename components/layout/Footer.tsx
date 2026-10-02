import Link from "next/link";
import { AirplaneTakeoff } from "@phosphor-icons/react/ssr";
import Logo from "@/components/layout/Logo";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { buildHubs, hubPath } from "@/lib/cities";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./Footer.module.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

// The footer is on every page, so a database outage must not take pages down with it.
async function loadRoutes(): Promise<RouteRow[]> {
  try {
    return await listActiveRoutes();
  } catch {
    return [];
  }
}

export default async function Footer() {
  const routes = await loadRoutes();
  const popular = buildHubs(routes, "from")
    .flatMap((hub) => hub.routes.slice(0, 2))
    .slice(0, 10);
  const cities = buildHubs(routes, "to").slice(0, 10);

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.cta}>
            <AirplaneTakeoff size={26} aria-hidden="true" />
            <span className={styles.ctaText}>Find your next cheap flight</span>
            <Link href="/search" className="button">
              Search flights
            </Link>
          </div>
          <p className={styles.help}>
            <span>How is this free?</span> <Link href="/disclosure">How we make money</Link>
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo inverse />
            <p>
              Compare flight prices and book with our travel partner, which pays us a commission at no extra cost to
              you.
            </p>
          </div>

          {popular.length > 0 && (
            <nav aria-label="Popular routes" className={styles.col}>
              <h2>Popular routes</h2>
              <ul className={styles.twoCol}>
                {popular.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/flights/${r.slug}`}>
                      {r.origin_city} to {r.destination_city}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <nav aria-label="Company" className={styles.col}>
            <h2>Company</h2>
            <ul>
              <li>
                <Link href="/flights">All flights</Link>
              </li>
              <li>
                <Link href="/destinations">Turkey &amp; the Silk Road</Link>
              </li>
              <li>
                <Link href="/guides">Travel guides</Link>
              </li>
              <li>
                <Link href="/disclosure">How we make money</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of use</Link>
              </li>
            </ul>
          </nav>
        </div>

        {cities.length > 0 && (
          <nav aria-label="Top cities" className={styles.cities}>
            <h2>Top cities</h2>
            <ul>
              {cities.map((hub) => (
                <li key={hub.slug}>
                  <Link href={hubPath("to", hub.name)}>{hub.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className={styles.bottom}>
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. Fares are cached and may change; confirm the final price
            before booking.
          </p>
          <p>
            Fares from Aviasales via Travelpayouts. City photos from{" "}
            <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">
              Unsplash
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
