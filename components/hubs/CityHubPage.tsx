import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { buildHubs, findHub, hubPath, type CityHub, type HubDirection } from "@/lib/cities";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice } from "@/lib/format";
import { buildSubId, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";
import PhotoHero from "@/components/layout/PhotoHero";
import HubFareCard from "@/components/hubs/HubFareCard";
import RouteTicket from "@/components/routes/RouteTicket";
import RouteFAQ from "@/components/route-page/RouteFAQ";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import styles from "./CityHubPage.module.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

const copy = {
  to: {
    title: (city: string) => `Cheap flights to ${city}`,
    gridHeading: (city: string) => `Flights to ${city} from popular cities`,
    other: (r: CityHubRoute) => r.origin_city,
    count: (n: number) => `${n} US ${n === 1 ? "city" : "cities"}`,
  },
  from: {
    title: (city: string) => `Cheap flights from ${city}`,
    gridHeading: (city: string) => `Popular destinations from ${city}`,
    other: (r: CityHubRoute) => r.destination_city,
    count: (n: number) => `${n} US ${n === 1 ? "destination" : "destinations"}`,
  },
};

type CityHubRoute = CityHub["routes"][number];

function lead(direction: HubDirection, hub: CityHub): string {
  const n = copy[direction].count(hub.routes.length);
  return direction === "to"
    ? `Compare the lowest recent one-way fares to ${hub.name} from ${n}, then book with our partner Aviasales.`
    : `Compare the lowest recent one-way fares from ${hub.name} to ${n}, then book with our partner Aviasales.`;
}

function buildFaq(direction: HubDirection, hub: CityHub) {
  const items: { question: string; answer: string }[] = [];
  const cheapest = hub.cheapest;
  const price = cheapest && formatPrice(cheapest.cheapest_price, cheapest.cheapest_currency);
  const preposition = direction === "to" ? "to" : "from";

  if (cheapest && price) {
    items.push({
      question: `How much are flights ${preposition} ${hub.name}?`,
      answer: `One-way fares ${preposition} ${hub.name} start from ${price} (${cheapest.origin_city} to ${cheapest.destination_city}), based on recent searches. Prices change often, so confirm the final fare before booking.`,
    });
    if (hub.routes.length > 1) {
      items.push({
        question:
          direction === "to"
            ? `Which city has the cheapest flights to ${hub.name}?`
            : `What is the cheapest destination from ${hub.name}?`,
        answer:
          direction === "to"
            ? `Of the cities we track, ${cheapest.origin_city} currently has the lowest recent fare to ${hub.name}, at ${price} one-way.`
            : `Of the destinations we track, ${cheapest.destination_city} currently has the lowest recent fare from ${hub.name}, at ${price} one-way.`,
      });
    }
  }

  items.push({
    question: "Do you sell plane tickets?",
    answer:
      "No. We compare fares and send you to our travel partner Aviasales, where you choose a booking option and pay. Changes, refunds and support are handled by the airline or agency you book with.",
  });
  return items;
}

export async function hubStaticParams(direction: HubDirection) {
  return buildHubs(await listActiveRoutes(), direction).map((hub) => ({ city: hub.slug }));
}

export async function hubMetadata(direction: HubDirection, slug: string): Promise<Metadata> {
  const hub = findHub(await listActiveRoutes(), direction, slug);
  if (!hub) return {};
  const title = copy[direction].title(hub.name);
  const price = hub.cheapest && formatPrice(hub.cheapest.cheapest_price, hub.cheapest.cheapest_currency);
  const others = hub.routes.slice(0, 3).map(copy[direction].other).join(", ");
  const description =
    direction === "to"
      ? `Compare cheap flights to ${hub.name} from ${others}${price ? `, from ${price} one-way` : ""}. Updated fare data, book with our travel partner.`
      : `Compare cheap flights from ${hub.name} to ${others}${price ? `, from ${price} one-way` : ""}. Updated fare data, book with our travel partner.`;
  const url = `${SITE_URL}${hubPath(direction, hub.name)}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title: `${title} | ${SITE_NAME}`, description, url } };
}

export default async function CityHubPage({ direction, slug }: { direction: HubDirection; slug: string }) {
  const routes = await listActiveRoutes();
  const hub = findHub(routes, direction, slug);
  if (!hub) notFound();

  const reverse = direction === "to" ? "from" : "to";
  const reverseHub = findHub(routes, reverse, hub.slug);
  const otherHubs = buildHubs(routes, direction).filter((h) => h.slug !== hub.slug);
  const title = copy[direction].title(hub.name);
  const widgetSrc = buildWidgetSrc(buildSubId(`hub_${direction}_${hub.slug}`));

  return (
    <main>
      <PhotoHero
        image={getCityImage(hub.name)}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: title, url: hubPath(direction, hub.name) },
        ]}
        kicker={<span>{hub.code}</span>}
        title={title}
        lead={lead(direction, hub)}
        aside={hub.cheapest ? <HubFareCard route={hub.cheapest} label="Cheapest right now" /> : undefined}
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{copy[direction].gridHeading(hub.name)}</h2>
            <p>Lowest one-way fares from recent searches, checked twice a day.</p>
          </div>
          <div className="ticket-grid">
            {hub.routes.map((route) => (
              <RouteTicket key={route.slug} route={route} />
            ))}
          </div>
        </div>
      </section>

      <section className="section band-surface">
        <div className="container">
          <div className="section-head">
            <h2>Search flights {direction === "to" ? "to" : "from"} {hub.name}</h2>
            <p>Pick your dates to compare live fares from airlines and booking sites.</p>
          </div>
          <TravelpayoutsWidget src={widgetSrc} title="Flight search" />
          <div style={{ marginTop: 12 }}>
            <AffiliateDisclosure />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="faq-wrap">
            <RouteFAQ items={buildFaq(direction, hub)} />
          </div>

          <nav className={styles.explore} aria-label="More city pages">
            <h2>Explore more cities</h2>
            <ul>
              {reverseHub && (
                <li>
                  <Link href={hubPath(reverse, hub.name)} className={styles.primaryChip}>
                    Flights {reverse} {hub.name}
                  </Link>
                </li>
              )}
              {otherHubs.map((h) => (
                <li key={h.slug}>
                  <Link href={hubPath(direction, h.name)}>
                    Flights {direction} {h.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </main>
  );
}
