import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { hubPath } from "@/lib/cities";
import { getCityImage } from "@/lib/cityImages";
import { formatPrice, formatShortDate, listNames } from "@/lib/format";
import { placeOgImages } from "@/lib/seo/metadata";
import { buildCountries, countryHref, countryPath, findCountry, type CountryGroup } from "@/lib/regions";
import { buildSubId, buildWidgetFallback, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";
import PhotoHero from "@/components/layout/PhotoHero";
import HubFareCard from "@/components/hubs/HubFareCard";
import RouteCard from "@/components/routes/RouteCard";
import RouteFAQ from "@/components/route-page/RouteFAQ";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import SectionHeader from "@/components/home/SectionHeader";
import GuideGrid from "@/components/guides/GuideGrid";
import { listGuides } from "@/lib/content/guides";
import styles from "./page.module.css";

export const revalidate = 21600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export async function generateStaticParams() {
  return buildCountries(await listActiveRoutes())
    .filter((g) => g.hasPage)
    .map((g) => ({ country: g.info.slug }));
}

// "the UK" when every route departs from there, so titles can say where from.
function originLabel(group: CountryGroup): string | null {
  const countries = new Set(group.routes.map((r) => r.origin_country.trim()));
  return countries.size === 1 && countries.has("GB") ? "the UK" : null;
}

export async function generateMetadata({ params }: PageProps<"/destinations/[country]">): Promise<Metadata> {
  const group = findCountry(await listActiveRoutes(), (await params).country);
  if (!group) return {};
  const from = originLabel(group);
  const title = `Cheap flights to ${group.info.name}${from ? ` from ${from}` : ""}`;
  const price = group.cheapest && formatPrice(group.cheapest.cheapest_price, group.cheapest.cheapest_currency);
  const description = `Compare cheap flights to ${listNames(group.cities.map((c) => c.name))}${price ? ` from ${price} one-way` : ""}, and see which city and departure airport are cheapest. Fares checked twice a day.`;
  const url = `${SITE_URL}${countryPath(group.info)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url, images: placeOgImages(group.info.photoCity) },
  };
}

function buildFaq(group: CountryGroup) {
  const items: { question: string; answer: string }[] = [];
  const name = group.info.name;
  const cheapest = group.cheapest;
  const price = cheapest && formatPrice(cheapest.cheapest_price, cheapest.cheapest_currency);
  if (cheapest && price) {
    items.push({
      question: `How much are flights to ${name}?`,
      answer: `One-way fares to ${name} start from ${price} (${cheapest.origin_city} to ${cheapest.destination_city}), based on recent searches. Prices change often, so confirm the final fare before booking.`,
    });
  }
  const pricedCities = group.cities.filter((c) => c.cheapest);
  if (pricedCities.length > 1) {
    const [first] = pricedCities;
    const others = pricedCities
      .slice(1)
      .map((c) => `${c.name} from ${formatPrice(c.cheapest!.cheapest_price, c.cheapest!.cheapest_currency)}`)
      .join(", ");
    items.push({
      question: `Which city in ${name} is cheapest to fly to?`,
      answer: `Of the cities we track, ${first.name} currently has the lowest fare, from ${formatPrice(first.cheapest!.cheapest_price, first.cheapest!.cheapest_currency)} one-way. For comparison: ${others}.`,
    });
  }
  if (group.byOrigin.length > 1) {
    const [best, ...rest] = group.byOrigin;
    items.push({
      question: `Which airport has the cheapest flights to ${name}?`,
      answer: `${best.origin_city} currently has the lowest fare to ${name}, from ${formatPrice(best.cheapest_price, best.cheapest_currency)} to ${best.destination_city}. ${rest
        .map((r) => `${r.origin_city} from ${formatPrice(r.cheapest_price, r.cheapest_currency)}`)
        .join(", ")}.`,
    });
  }
  items.push({
    question: "Do you sell plane tickets?",
    answer: `No. ${SITE_NAME} compares fares and links you to our travel partner Aviasales, where you book directly with an airline or agency. We may earn a commission at no extra cost to you.`,
  });
  return items;
}

export default async function CountryPage({ params }: PageProps<"/destinations/[country]">) {
  const routes = await listActiveRoutes();
  const group = findCountry(routes, (await params).country);
  if (!group) notFound();

  const { info } = group;
  const from = originLabel(group);
  const title = `Cheap flights to ${info.name}`;
  const cityNames = group.cities.map((c) => c.name);
  const origins = new Set(group.routes.map((r) => r.origin_city));
  const others = buildCountries(routes).filter((g) => g.info.code !== info.code);
  const guides = listGuides().filter((g) => g.countries.includes(info.code));
  const currency = group.routes[0]?.currency.trim();
  const widgetSubId = buildSubId(`country_${info.slug}`);
  const widgetSrc = buildWidgetSrc(widgetSubId, currency);
  const widgetFallback = buildWidgetFallback(widgetSubId);

  return (
    <main>
      <PhotoHero
        image={getCityImage(info.photoCity)}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Destinations", url: "/destinations" },
          { name: info.name, url: countryPath(info) },
        ]}
        kicker={<span>{group.cities.map((c) => c.code).join(" · ")}</span>}
        title={title}
        lead={`Compare the lowest recent one-way fares to ${listNames(cityNames)} from ${origins.size} ${
          from === "the UK" ? "UK " : ""
        }${origins.size === 1 ? "airport" : "airports"}, then book with our partner Aviasales.`}
        aside={group.cheapest ? <HubFareCard route={group.cheapest} label="Cheapest right now" /> : undefined}
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Where to fly in {info.name}</h2>
            <p>The lowest one-way fare we&apos;ve found to each city, cheapest first.</p>
          </div>
          <ul className={styles.cities}>
            {group.cities.map((city) => {
              const photo = getCityImage(city.name);
              const price = city.cheapest && formatPrice(city.cheapest.cheapest_price, city.cheapest.cheapest_currency);
              return (
                <li key={city.slug}>
                  <Link href={hubPath("to", city.name)} className={styles.city}>
                    <span className={styles.cityPhoto}>
                      {photo && <Image src={photo.src} alt="" fill sizes="96px" placeholder="blur" className={styles.img} />}
                    </span>
                    <span className={styles.cityText}>
                      <span className={styles.cityName}>{city.name}</span>
                      <span className={styles.cityMeta}>
                        {city.code} · {city.routes.length} {city.routes.length === 1 ? "route" : "routes"} from the UK
                      </span>
                      <span className={styles.cityPrice}>{price ? `From ${price}` : "Checking fares"}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {group.byOrigin.length > 1 && (
        <section className="section band-surface">
          <div className="container">
            <div className="section-head">
              <h2>Cheapest airport to fly from</h2>
              <p>The lowest fare to {info.name} from each departure city we track.</p>
            </div>
            <ol className={styles.origins}>
              {group.byOrigin.map((route, i) => {
                const departs = formatShortDate(route.cheapest_depart_date);
                return (
                  <li key={route.slug}>
                    <Link href={`/flights/${route.slug}`} className={styles.origin}>
                      <span className={styles.rank}>{i + 1}</span>
                      <span className={styles.originText}>
                        <span className={styles.originName}>From {route.origin_city}</span>
                        <span className={styles.originMeta}>
                          to {route.destination_city}
                          {departs ? `, departs ${departs}` : ""}
                        </span>
                      </span>
                      <span className={styles.originPrice}>
                        {formatPrice(route.cheapest_price, route.cheapest_currency)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>All flights to {info.name}</h2>
            <p>Every route we track, with its cheapest one-way fare. Each route page shows the cheapest days to fly.</p>
          </div>
          <ul className="card-grid">
            {group.routes.map((route) => (
              <li key={route.slug}>
                <RouteCard route={route} photoCity={route.destination_city} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section band-surface">
        <div className="container">
          <div className="section-head">
            <h2>Search flights to {info.name}</h2>
            <p>Pick your dates to compare live fares from airlines and booking sites.</p>
          </div>
          <TravelpayoutsWidget src={widgetSrc} title="Flight search" fallback={widgetFallback} />
          <div className={styles.note}>
            <AffiliateDisclosure />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {guides.length > 0 && (
            <div className={styles.guides}>
              <SectionHeader title={`Guides for ${info.name}`} href="/guides" linkLabel="All guides" />
              <GuideGrid guides={guides} />
            </div>
          )}
          <div className="faq-wrap">
            <RouteFAQ items={buildFaq(group)} />
          </div>
          {others.length > 0 && (
            <nav className={styles.explore} aria-label="More destinations">
              <h2>More destinations</h2>
              <ul>
                {others.map((g) => (
                  <li key={g.info.code}>
                    <Link href={countryHref(g)}>Flights to {g.info.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
