import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarBlank, MagnifyingGlass, Ticket } from "@phosphor-icons/react/ssr";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { listGuides } from "@/lib/content/guides";
import { buildHubs, hubPath } from "@/lib/cities";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice } from "@/lib/format";
import { buildSubId, buildWidgetFallback, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import SectionHeader from "@/components/home/SectionHeader";
import DealCard from "@/components/home/DealCard";
import RouteListItem from "@/components/home/RouteListItem";
import RouteFAQ from "@/components/route-page/RouteFAQ";
import GuideGrid from "@/components/guides/GuideGrid";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./home.module.css";

export const revalidate = 21600; // matches route pages; cron revalidation keeps it fresher

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function byPrice(a: RouteRow, b: RouteRow): number {
  if (a.cheapest_price === null) return 1;
  if (b.cheapest_price === null) return -1;
  return Number(a.cheapest_price) - Number(b.cheapest_price);
}

// Cheapest-first, one route per destination, so a single cheap hub
// (and its photo) doesn't fill a whole section.
function pickByDestination(routes: RouteRow[], count: number, exclude: Set<string>): RouteRow[] {
  const picked: RouteRow[] = [];
  for (const route of routes) {
    if (picked.length === count) break;
    if (exclude.has(route.destination_city)) continue;
    exclude.add(route.destination_city);
    picked.push(route);
  }
  return picked;
}

const STEPS = [
  {
    icon: MagnifyingGlass,
    title: "Search",
    body: "Enter your trip and compare fares from airlines and booking sites in one place.",
  },
  {
    icon: CalendarBlank,
    title: "Compare dates",
    body: "Route pages show the cheapest days to fly over the next few months.",
  },
  {
    icon: Ticket,
    title: "Book with our partner",
    body: "You book on Aviasales. They pay us a commission; you never pay us a fee.",
  },
];

const FAQ = [
  {
    question: "How does FarePockets find cheap flights?",
    answer:
      "We track recent fares on popular US routes using flight data from Aviasales, and our search compares fares from airlines and booking sites in one place.",
  },
  {
    question: "Do I book my flight on FarePockets?",
    answer:
      "No. When you pick a flight you book on Aviasales or the airline or agency it links to. That is where you pay and receive your ticket.",
  },
  {
    question: "Are the prices shown final?",
    answer:
      "Prices come from recent searches and can change quickly. Always confirm the final fare, including baggage fees, before you pay.",
  },
  {
    question: "Is FarePockets free to use?",
    answer:
      "Yes. We never charge you. We may earn a commission from our travel partner when you book, at no extra cost to you.",
  },
];

export default async function Home() {
  const routes = (await listActiveRoutes()).sort(byPrice);
  const priced = routes.filter((r) => r.cheapest_price !== null);
  const used = new Set<string>();
  const deals = pickByDestination(priced, 3, used);
  const popular = pickByDestination(priced, 8, used);
  const destinations = buildHubs(routes, "to").slice(0, 12);
  const pills = buildHubs(routes, "from")
    .map((hub) => hub.cheapest)
    .filter((r): r is RouteRow => r !== null)
    .slice(0, 5);
  const guides = listGuides().slice(0, 4);
  const widgetSubId = buildSubId("home_hero");
  const widgetSrc = buildWidgetSrc(widgetSubId);
  const widgetFallback = buildWidgetFallback(widgetSubId);
  const heroLeft = getCityImage("New York");
  const heroRight = getCityImage("Miami");
  // Decorative photos avoid cities already pictured in the deals and route list.
  const spare = ["San Francisco", "Los Angeles", "Boston", "Washington DC", "Chicago", "Dallas", "Seattle"].filter(
    (city) => !used.has(city) && getCityImage(city),
  );
  const featureImage = getCityImage(spare[0] ?? "San Francisco");
  const bannerImage = getCityImage(spare[1] ?? "Los Angeles");

  return (
    <main>
      <section className={styles.hero}>
        {heroLeft && (
          <div className={`${styles.heroPhoto} ${styles.heroPhotoLeft}`} aria-hidden="true">
            <Image src={heroLeft.src} alt="" fill sizes="260px" placeholder="blur" className={styles.cover} preload />
          </div>
        )}
        {heroRight && (
          <div className={`${styles.heroPhoto} ${styles.heroPhotoRight}`} aria-hidden="true">
            <Image src={heroRight.src} alt="" fill sizes="260px" placeholder="blur" className={styles.cover} />
          </div>
        )}
        <div className={`container ${styles.heroInner}`}>
          <h1>Find cheap flights across the US</h1>
          <p className={styles.heroLead}>
            Compare airlines and booking sites in one search, then book with our partner Aviasales.
          </p>
          <div className={styles.searchCard}>
            <TravelpayoutsWidget src={widgetSrc} title="Flight search" fallback={widgetFallback} eager />
          </div>
          {pills.length > 0 && (
            <ul className={styles.pills} aria-label="Popular routes">
              {pills.map((r) => (
                <li key={r.slug}>
                  <Link href={`/flights/${r.slug}`}>
                    {r.origin_city} to {r.destination_city}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <AffiliateDisclosure inverse className={styles.heroNote} />
        </div>
      </section>

      {destinations.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Browse flights by destination" href="/flights" />
            <ul className={styles.cityGrid}>
              {destinations.map((hub) => {
                const photo = getCityImage(hub.name);
                const price = hub.cheapest && formatPrice(hub.cheapest.cheapest_price, hub.cheapest.cheapest_currency);
                return (
                  <li key={hub.slug}>
                    <Link href={hubPath("to", hub.name)} className={styles.city}>
                      <span className={styles.cityThumb}>
                        {photo ? (
                          <Image src={photo.src} alt="" fill sizes="48px" className={styles.cover} />
                        ) : (
                          <span>{hub.code}</span>
                        )}
                      </span>
                      <span className={styles.cityText}>
                        <span className={styles.cityName}>{hub.name}</span>
                        <span className={styles.cityMeta}>{price ? `Flights from ${price}` : "Checking fares"}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className={`container ${styles.split}`}>
            <aside className={styles.feature}>
              <div>
                <h2>Find your cheapest fare</h2>
                <p>Compare airlines and booking sites, then book with our partner. No fees from us.</p>
                <Link href="/search" className="button">
                  Search flights
                  <ArrowRight size={16} weight="bold" aria-hidden="true" />
                </Link>
              </div>
              {featureImage && (
                <div className={styles.featureImage}>
                  <Image
                    src={featureImage.src}
                    alt={featureImage.alt}
                    fill
                    sizes="(max-width: 899px) 100vw, 360px"
                    placeholder="blur"
                    className={styles.cover}
                  />
                </div>
              )}
            </aside>
            <div>
              <SectionHeader title="Popular routes right now" href="/flights" />
              <ul className={styles.routeList}>
                {popular.map((route) => (
                  <li key={route.slug}>
                    <RouteListItem route={route} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section className="section band-surface">
          <div className="container">
            <SectionHeader
              title="Top flight deals"
              description="The cheapest one-way fares on our routes, from recent searches."
              href="/flights"
            />
            <div className={styles.dealGrid}>
              {deals.map((route) => (
                <DealCard key={route.slug} route={route} />
              ))}
            </div>
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Travel tips" href="/guides" />
            <GuideGrid guides={guides} />
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: guides.length > 0 ? 0 : undefined }}>
        <div className="container">
          <SectionHeader
            title="How it works"
            description="Find a cheap fare and book it with a trusted partner in three steps."
          />
          <ol className={styles.steps}>
            {STEPS.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <span className={styles.stepIcon} aria-hidden="true">
                  <Icon size={30} weight="duotone" />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.banner}>
        <div className={styles.bannerText}>
          <div className={styles.bannerInner}>
            <h2>
              {routes.length} routes across the US, checked twice a day
            </h2>
            <p>Browse every route we track, or search any trip you have in mind.</p>
            <div className={styles.bannerButtons}>
              <Link href="/flights" className="button">
                See all flights
              </Link>
              <Link href="/search" className={`button ${styles.ghost}`}>
                Search flights
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
