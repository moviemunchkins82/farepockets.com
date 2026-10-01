import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { buildHubs, hubPath } from "@/lib/cities";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice } from "@/lib/format";
import SectionHeader from "@/components/home/SectionHeader";
import DealCard from "@/components/home/DealCard";
import DealsExplorer, { type DealItem } from "@/components/deals/DealsExplorer";
import RouteFAQ from "@/components/route-page/RouteFAQ";
import Breadcrumbs from "@/components/route-page/Breadcrumbs";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./page.module.css";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Flight deals across the US",
  description: "Cheap one-way flight deals on popular US routes, grouped by departure city and checked twice a day.",
  alternates: { canonical: "/flights" },
};

function byPrice(a: RouteRow, b: RouteRow): number {
  if (a.cheapest_price === null) return 1;
  if (b.cheapest_price === null) return -1;
  return Number(a.cheapest_price) - Number(b.cheapest_price);
}

const FAQ = [
  {
    question: "How often are these deals updated?",
    answer:
      "We check fares on every route twice a day. Each deal shows the lowest one-way fare found in recent searches and the date it departs.",
  },
  {
    question: "Why is the price different when I click through?",
    answer:
      "Fares change quickly and depend on seats left, bags and the booking site. The deal price is a recent low, so always confirm the final fare before you pay.",
  },
  {
    question: "Can I find deals for a route that isn't listed?",
    answer:
      "Yes. Use the flight search to compare fares for any trip. These pages cover the popular US routes we track daily.",
  },
];

export default async function DealsPage() {
  const routes = (await listActiveRoutes()).sort(byPrice);
  const priced = routes.filter((r) => r.cheapest_price !== null);
  const fromHubs = buildHubs(routes, "from");

  // One deal per destination so the top cards show six different cities.
  const topDeals: RouteRow[] = [];
  for (const r of priced) {
    if (topDeals.length < 6 && !topDeals.some((d) => d.destination_city === r.destination_city)) topDeals.push(r);
  }
  const lowest = priced[0] ? formatPrice(priced[0].cheapest_price, priced[0].cheapest_currency) : null;
  const bannerImage = getCityImage("Seattle");
  const dealItems: DealItem[] = routes.map((r) => ({
    slug: r.slug,
    originCity: r.origin_city,
    originCode: r.origin_iata.trim(),
    destinationCity: r.destination_city,
    destinationCode: r.destination_iata.trim(),
    price: r.cheapest_price === null ? null : Number(r.cheapest_price),
    departDate: r.cheapest_depart_date ? r.cheapest_depart_date.toISOString().slice(0, 10) : null,
  }));

  return (
    <main>
      <section className={styles.hero}>
        <div className="container">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Flight deals", url: "/flights" },
            ]}
          />
          <h1>Flight deals across the US</h1>
          <p className={styles.lead}>
            {routes.length} routes from {fromHubs.length} cities
            {lowest ? `, with fares from ${lowest} one-way` : ""}. Checked twice a day.
          </p>
          <nav aria-label="Flights by departure city">
            <ul className={styles.pills}>
              {fromHubs.map((hub) => (
                <li key={hub.slug}>
                  <Link href={hubPath("from", hub.name)}>{hub.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {topDeals.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader
              title="Cheapest deals right now"
              description="The lowest one-way fares on our routes, one per destination."
            />
            <div className={styles.dealGrid}>
              {topDeals.map((route) => (
                <DealCard key={route.slug} route={route} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="all-deals" className="section band-surface">
        <div className="container">
          <SectionHeader
            title="All flight deals"
            description="Filter by city, price or month to find your route. Every route links to its cheapest dates."
          />
          <DealsExplorer deals={dealItems} />
        </div>
      </section>

      <section className={styles.banner}>
        <div className={styles.bannerText}>
          <div className={styles.bannerInner}>
            <h2>Can&apos;t find your route?</h2>
            <p>Search any trip to compare fares from airlines and booking sites.</p>
            <div className={styles.bannerButtons}>
              <Link href="/search" className="button">
                Search flights
              </Link>
              <Link href="/guides" className={`button ${styles.ghost}`}>
                Booking tips
              </Link>
            </div>
          </div>
        </div>
        {bannerImage && (
          <div className={styles.bannerImage}>
            <Image src={bannerImage.src} alt={bannerImage.alt} fill sizes="(max-width: 899px) 100vw, 50vw" placeholder="blur" className={styles.cover} />
          </div>
        )}
      </section>

      <section className="section">
        <div className="container">
          <div className="faq-wrap">
            <RouteFAQ items={FAQ} />
          </div>
        </div>
      </section>
    </main>
  );
}
