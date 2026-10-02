import Link from "next/link";
import type { Metadata } from "next";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice } from "@/lib/format";
import { buildCountries, countryHref } from "@/lib/regions";
import { byPrice } from "@/lib/prices";
import { buildSubId, buildWidgetFallback, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";
import PhotoHero from "@/components/layout/PhotoHero";
import SectionHeader from "@/components/home/SectionHeader";
import DealCard from "@/components/home/DealCard";
import CountryCard from "@/components/regions/CountryCard";
import RouteFAQ from "@/components/route-page/RouteFAQ";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import GuideGrid from "@/components/guides/GuideGrid";
import { listGuides } from "@/lib/content/guides";
import { SILK_ROAD } from "@/lib/regions";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./page.module.css";

export const revalidate = 21600;

const TITLE = "Cheap flights to Turkey, the Caucasus and Central Asia";
const DESCRIPTION =
  "Compare cheap flights from the UK to Istanbul, the Turkish coast, Tbilisi, Baku, Yerevan, Tashkent, Samarkand and Almaty. Fares checked twice a day.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const routes = await listActiveRoutes();
  const countries = buildCountries(routes);
  const regionRoutes = countries.flatMap((g) => g.routes).sort(byPrice);
  const origins = new Set(regionRoutes.map((r) => r.origin_city));
  const cheapest = countries
    .map((g) => g.cheapest)
    .filter((r): r is RouteRow => r !== null)
    .sort(byPrice);

  // One deal per destination city so the cards show different places.
  const deals: RouteRow[] = [];
  for (const r of regionRoutes) {
    if (deals.length < 6 && r.cheapest_price !== null && !deals.some((d) => d.destination_city === r.destination_city)) {
      deals.push(r);
    }
  }

  const regionCodes = new Set(SILK_ROAD.map((c) => c.code));
  const guides = listGuides().filter((g) => g.countries.some((c) => regionCodes.has(c)));
  const widgetSubId = buildSubId("destinations_hub");
  const widgetSrc = buildWidgetSrc(widgetSubId, regionRoutes[0]?.currency.trim());
  const widgetFallback = buildWidgetFallback(widgetSubId);

  const faq = [
    ...(cheapest[0]
      ? [
          {
            question: "Which of these countries is cheapest to fly to from the UK?",
            answer: `Right now ${countries.find((g) => g.cheapest === cheapest[0])?.info.name} has the lowest fare we track, from ${formatPrice(
              cheapest[0].cheapest_price,
              cheapest[0].cheapest_currency,
            )} one-way (${cheapest[0].origin_city} to ${cheapest[0].destination_city}). ${cheapest
              .slice(1)
              .map((r) => `${countries.find((g) => g.cheapest === r)?.info.name} from ${formatPrice(r.cheapest_price, r.cheapest_currency)}`)
              .join(", ")}.`,
          },
        ]
      : []),
    {
      question: "Which UK airports have flights to these destinations?",
      answer: `We track fares from ${[...origins].join(", ")}. Many of the cheapest fares have at least one stop. Each route page shows the cheapest days to fly over the next three months.`,
    },
    {
      question: "How often are these fares updated?",
      answer:
        "We check every route twice a day. Each price is the lowest one-way fare found in recent searches on our travel partner Aviasales, so always confirm the final fare before you book.",
    },
  ];

  return (
    <main>
      <PhotoHero
        image={getCityImage("Istanbul")}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Destinations", url: "/destinations" },
        ]}
        kicker={<span>Turkey &amp; the Silk Road</span>}
        title={TITLE}
        lead={`We track ${regionRoutes.length} routes from ${origins.size} UK airports to ${countries.length} countries, from Istanbul and the Turkish coast to Tbilisi, Tashkent and Almaty.`}
      />

      <section className="section">
        <div className="container">
          <SectionHeader
            title="Choose a country"
            description="The cheapest one-way fare we've found to each country, and the cities we cover."
          />
          <ul className={styles.countries}>
            {countries.map((group) => (
              <li key={group.info.code}>
                <CountryCard group={group} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {deals.length > 0 && (
        <section className="section band-surface">
          <div className="container">
            <SectionHeader
              title="Cheapest flights in the region"
              description="The lowest one-way fares right now, one per destination."
              href="/flights?country=gb"
              linkLabel="All UK deals"
            />
            <div className="deal-grid">
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
            <SectionHeader title="Plan your trip" description="Which airports, how many stops and when to go, based on our fare data." href="/guides" linkLabel="All guides" />
            <GuideGrid guides={guides} />
          </div>
        </section>
      )}

      <section className={`section ${guides.length > 0 ? "band-surface" : ""}`}>
        <div className="container">
          <div className="section-head">
            <h2>Search any trip</h2>
            <p>Compare live fares from airlines and booking sites for your own dates.</p>
          </div>
          <TravelpayoutsWidget src={widgetSrc} title="Flight search" fallback={widgetFallback} />
          <div className={styles.note}>
            <AffiliateDisclosure />
          </div>
        </div>
      </section>

      <section className={`section ${guides.length > 0 ? "" : "band-surface"}`}>
        <div className="container">
          <div className="faq-wrap">
            <RouteFAQ items={faq} />
          </div>
          <nav className={styles.explore} aria-label="Country pages">
            <h2>Flights by country</h2>
            <ul>
              {countries.map((g) => (
                <li key={g.info.code}>
                  <Link href={countryHref(g)}>Flights to {g.info.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </main>
  );
}
