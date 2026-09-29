import { CalendarBlank, CurrencyDollar, MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react/ssr";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { getGuide, listGuideSlugs } from "@/lib/content/guides";
import { buildSubId, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import RouteTicket from "@/components/routes/RouteTicket";
import OfferCard from "@/components/home/OfferCard";
import GuideList from "@/components/guides/GuideList";
import RouteFAQ from "@/components/route-page/RouteFAQ";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./home.module.css";

export const revalidate = 21600; // matches route pages; cron revalidation keeps it fresher

function byPrice(a: RouteRow, b: RouteRow): number {
  if (a.cheapest_price === null) return 1;
  if (b.cheapest_price === null) return -1;
  return Number(a.cheapest_price) - Number(b.cheapest_price);
}

const USPS = [
  {
    icon: MagnifyingGlass,
    title: "Compare in one search",
    body: "Fares from airlines and booking sites, side by side.",
  },
  {
    icon: CurrencyDollar,
    title: "No fees from us",
    body: "We never add a markup. You pay our partner's price.",
  },
  {
    icon: CalendarBlank,
    title: "Cheapest dates shown",
    body: "See the lowest recent fare and the day it departs.",
  },
  {
    icon: ShieldCheck,
    title: "Book with a trusted partner",
    body: "Tickets and payment are handled by Aviasales.",
  },
];

const OFFER_BADGES = ["Lowest fare right now", "Top deal", "Top deal"];

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
  const offers = routes.filter((r) => r.cheapest_price !== null).slice(0, 3);
  const guides = listGuideSlugs()
    .map((slug) => getGuide(slug))
    .filter((g): g is NonNullable<typeof g> => g !== null)
    .slice(0, 3);
  const widgetSrc = buildWidgetSrc(buildSubId("home_hero"));

  return (
    <main>
      <section className={styles.hero}>
        <div className="container">
          <h1>Compare cheap flights across the US</h1>
          <p className={styles.heroLead}>
            Search airlines and booking sites in one place, then book with our partner Aviasales.
          </p>
          <div className={styles.searchCard}>
            <TravelpayoutsWidget src={widgetSrc} title="Flight search" />
          </div>
          <AffiliateDisclosure inverse className={styles.heroNote} />
        </div>
      </section>

      <section className={styles.usps} aria-label="Why use FarePockets">
        <div className={`container ${styles.uspGrid}`}>
          {USPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className={styles.usp}>
              <span className={styles.uspIcon} aria-hidden="true">
                <Icon size={24} weight="duotone" />
              </span>
              <div>
                <h2>{title}</h2>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>Top flight deals right now</h2>
              <p>The cheapest one-way fares found on our routes, from recent searches.</p>
            </div>
            <div className={styles.offerGrid}>
              {offers.map((route, i) => (
                <OfferCard key={route.slug} route={route} index={i} badge={OFFER_BADGES[i]} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="deals" className={`section ${styles.dealsBand}`}>
        <div className="container">
          <div className="section-head">
            <h2>Flight deals from popular US cities</h2>
            <p>Lowest one-way fares from recent searches, checked twice a day.</p>
          </div>
          {routes.length > 0 ? (
            <div className={styles.dealGrid}>
              {routes.map((route) => (
                <RouteTicket key={route.slug} route={route} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Deals are on their way. In the meantime, search any trip above.</p>
          )}
        </div>
      </section>

      {guides.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>Tips for booking cheaper flights</h2>
            </div>
            <GuideList guides={guides} />
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className={styles.faq}>
            <RouteFAQ items={FAQ} />
          </div>
        </div>
      </section>
    </main>
  );
}
