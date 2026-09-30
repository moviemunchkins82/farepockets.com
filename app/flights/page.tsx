import Link from "next/link";
import type { Metadata } from "next";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { buildHubs, hubPath } from "@/lib/cities";
import { formatPrice } from "@/lib/format";
import PageHeader from "@/components/layout/PageHeader";
import styles from "./page.module.css";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Cheap flights between US cities",
  description: "Browse every route we track, grouped by departure city, with the lowest recent one-way fares.",
  alternates: { canonical: "/flights" },
};

export default async function AllFlightsPage() {
  const hubs = buildHubs(await listActiveRoutes(), "from").sort((a, b) => a.name.localeCompare(b.name));
  const routeCount = hubs.reduce((n, h) => n + h.routes.length, 0);

  return (
    <main>
      <PageHeader
        title="Cheap flights between US cities"
        description={`${routeCount} routes from ${hubs.length} cities, with the lowest one-way fares from recent searches.`}
      />
      <section className="section">
        <div className={`container ${styles.grid}`}>
          {hubs.map((hub) => (
            <section key={hub.slug} className={styles.city} aria-labelledby={`from-${hub.slug}`}>
              <h2 id={`from-${hub.slug}`}>
                <Link href={hubPath("from", hub.name)}>Flights from {hub.name}</Link>
              </h2>
              <ul>
                {hub.routes.map((route) => {
                  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
                  return (
                    <li key={route.slug}>
                      <Link href={`/flights/${route.slug}`}>
                        <span>to {route.destination_city}</span>
                        <span className={styles.price}>{price ? `from ${price}` : "Checking"}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
