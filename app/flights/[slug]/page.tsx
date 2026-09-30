import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AirplaneInFlight, ArrowRight } from "@phosphor-icons/react/ssr";
import { getRouteBySlug, listActiveRoutes } from "@/lib/db/queries/routes";
import { routeMetadata } from "@/lib/seo/metadata";
import { buildSubId, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";
import { formatDate, formatLongDate, formatPrice } from "@/lib/format";
import { getCityImage } from "@/lib/cityImages";
import { hubPath } from "@/lib/cities";
import PriceCard from "@/components/route-page/PriceCard";
import PriceCalendar, { calendarData, monthlyLows } from "@/components/route-page/PriceCalendar";
import RouteFAQ from "@/components/route-page/RouteFAQ";
import PhotoHero from "@/components/layout/PhotoHero";
import RouteTicket from "@/components/routes/RouteTicket";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import type { RouteRow } from "@/lib/db/schema";
import type { PriceCalendarData } from "@/lib/travelpayouts/types";
import styles from "./page.module.css";

export const revalidate = 21600; // 6h ISR window — cron refresh cadence drives real freshness

export async function generateStaticParams() {
  const routes = await listActiveRoutes();
  return routes.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }: PageProps<"/flights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) return {};
  return routeMetadata(route);
}

// Return trip first, then routes sharing a city, then anything else.
function relatedRoutes(route: RouteRow, all: RouteRow[]): RouteRow[] {
  const others = all.filter((r) => r.slug !== route.slug);
  const score = (r: RouteRow) => {
    if (r.origin_city === route.destination_city && r.destination_city === route.origin_city) return 0;
    if ([r.origin_city, r.destination_city].some((c) => c === route.origin_city || c === route.destination_city)) return 1;
    return 2;
  };
  return others.sort((a, b) => score(a) - score(b)).slice(0, 3);
}

function buildFaq(route: RouteRow, calendar: PriceCalendarData | null) {
  const from = route.origin_city;
  const to = route.destination_city;
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const cheapestDate = formatLongDate(route.cheapest_depart_date);
  const checked = formatDate(route.last_refreshed_at);
  const lows = calendar ? monthlyLows(calendar) : [];

  const items = [
    {
      question: `How much do flights from ${from} to ${to} cost?`,
      answer: price
        ? `One-way fares start from ${price}, based on recent searches${checked ? ` checked on ${checked}` : ""}. Prices change often, so confirm the final fare on our partner's site before booking.`
        : `We're updating fare data for this route. Use the search on this page to see live prices.`,
    },
  ];

  if (price && cheapestDate) {
    items.push({
      question: `What is the cheapest date to fly from ${from} to ${to}?`,
      answer: `The lowest recent one-way fare we found departs on ${cheapestDate}. Try nearby dates too, since fares can differ by the day.`,
    });
  }

  if (lows.length >= 2) {
    const best = lows.reduce((a, b) => (b.price < a.price ? b : a));
    const others = lows
      .filter((l) => l.month !== best.month)
      .map((l) => `${l.label} from ${formatPrice(l.price)}`)
      .join(" and ");
    items.push({
      question: `What is the cheapest month to fly from ${from} to ${to}?`,
      answer: `Of the next ${lows.length} months, ${best.label} has the lowest fare we've seen: ${formatPrice(best.price)} on ${formatLongDate(best.date)}. For comparison, ${others}.`,
    });
  }

  items.push({
    question: "Do you sell plane tickets?",
    answer:
      "No. We compare fares and send you to our travel partner Aviasales, where you choose a booking option and pay. Changes, refunds and support are handled by the airline or agency you book with.",
  });

  return items;
}

export default async function RoutePage({ params }: PageProps<"/flights/[slug]">) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  const related = relatedRoutes(route, await listActiveRoutes());
  const calendar = calendarData(route);
  const hasCalendarFares = !!calendar?.months.some((m) => m.days.length > 0);
  const widgetSrc = buildWidgetSrc(buildSubId(`route_${route.slug}_search`));
  const origin = route.origin_iata.trim();
  const destination = route.destination_iata.trim();

  return (
    <main>
      <PhotoHero
        image={getCityImage(route.destination_city)}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: `Flights to ${route.destination_city}`, url: hubPath("to", route.destination_city) },
          { name: `${route.origin_city} to ${route.destination_city}`, url: `/flights/${route.slug}` },
        ]}
        kicker={
          <>
            <span>{origin}</span>
            <AirplaneInFlight size={22} weight="duotone" aria-label="to" />
            <span>{destination}</span>
          </>
        }
        title={`Flights from ${route.origin_city} to ${route.destination_city}`}
        lead="See the lowest recent fare, then compare every option and book with our partner Aviasales."
        aside={<PriceCard route={route} />}
      />

      {calendar && hasCalendarFares && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>
                Cheapest days to fly {route.origin_city} to {route.destination_city}
              </h2>
              <p>The lowest one-way fare found for each day over the next few months.</p>
            </div>
            <PriceCalendar route={route} calendar={calendar} />
          </div>
        </section>
      )}

      <section className="section band-surface">
        <div className="container">
          <div className="section-head">
            <h2>Search other dates</h2>
            <p>
              Choose your own dates for {route.origin_city} to {route.destination_city} and compare live fares.
            </p>
          </div>
          <TravelpayoutsWidget src={widgetSrc} title="Flight search" />
          <nav className={styles.hubLinks} aria-label="Related city pages">
            <Link href={hubPath("to", route.destination_city)}>
              All flights to {route.destination_city}
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </Link>
            <Link href={hubPath("from", route.origin_city)}>
              All flights from {route.origin_city}
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>More routes</h2>
            </div>
            <div className="ticket-grid">
              {related.map((r) => (
                <RouteTicket key={r.slug} route={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="faq-wrap">
            <RouteFAQ items={buildFaq(route, calendar)} />
          </div>
        </div>
      </section>
    </main>
  );
}
