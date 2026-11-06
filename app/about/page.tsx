import Link from "next/link";
import type { Metadata } from "next";
import { listActiveRoutes } from "@/lib/routes/data";
import { listGuides } from "@/lib/content/guides";
import { DEFAULT_AUTHOR } from "@/lib/content/authors";
import PageHeader from "@/components/layout/PageHeader";
import JsonLd from "@/components/seo/JsonLd";
import type { RouteRow } from "@/lib/routes/types";
import styles from "./page.module.css";


const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@farepockets.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";
const DESCRIPTION = `${SITE_NAME} is an independent flight comparison site. We track cheap fares, show the cheapest days to fly, and link you to our travel partner to book.`;

export const metadata: Metadata = {
  title: `About ${SITE_NAME}: how we find cheap flights`,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
};

async function loadRoutes(): Promise<RouteRow[]> {
  try {
    return await listActiveRoutes();
  } catch {
    return [];
  }
}

export default async function AboutPage() {
  const routes = await loadRoutes();
  const guides = listGuides();
  const origins = new Set(routes.map((r) => r.origin_city));
  const countries = new Set(routes.map((r) => r.destination_country.trim()));
  const stats = [
    { value: routes.length, label: "routes tracked" },
    { value: origins.size, label: "departure cities" },
    { value: countries.size, label: "destination countries" },
    { value: guides.length, label: "data-backed guides" },
  ].filter((s) => s.value > 0);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `About ${SITE_NAME}`,
          url: `${SITE_URL}/about`,
          description: DESCRIPTION,
          mainEntity: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: CONTACT_EMAIL },
        }}
      />
      <PageHeader
        title={`About ${SITE_NAME}`}
        description="An independent flight comparison site: we find cheap fares, show you when to fly, and send you to our partner to book."
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ]}
      />

      <div className="container page">
        {stats.length > 0 && (
          <ul className={styles.stats}>
            {stats.map((s) => (
              <li key={s.label}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="prose">
          <h2>What we do</h2>
          <p>
            {SITE_NAME} helps you find a cheap flight and the best day to take it. For every route we track, we show the
            lowest recent one-way fare, a calendar of the cheapest days over the next few months, and useful facts such
            as whether there are nonstop flights and which airlines fly it. When you are ready, our search compares
            airlines and booking sites in one place.
          </p>

          <h2>Where we focus</h2>
          <p>
            Our speciality is flights to <Link href="/destinations">Turkey, the Caucasus and Central Asia</Link>: Istanbul
            and the Turkish coast, Georgia, Armenia, Azerbaijan, Uzbekistan, Kazakhstan and Kyrgyzstan. We cover them from
            the UK and the US, and add more departure countries once our partner has enough fares from them. We also cover
            popular routes across the US and from the UK to Europe and beyond.
          </p>

          <h2>Where our fares come from</h2>
          <p>
            Fares come from recent searches on our travel partner Aviasales, collected through the Travelpayouts
            affiliate network. We store the lowest fare found for each route and each departure day, and every route page
            shows when its fares were last checked. Airline prices change constantly, so the fare you see is a recent
            low, not a guaranteed price. Always confirm the final fare, including baggage, before you pay.
          </p>

          <h2>How we make money</h2>
          <p>
            We don&apos;t sell tickets, take payments or charge you anything. When you book through one of our links,
            our partner may pay us a commission, at no extra cost to you. It doesn&apos;t change what we show: routes and
            deals are ranked by price. Read more in <Link href="/disclosure">how we make money</Link>.
          </p>

          <h2>How we write our guides</h2>
          <p>
            Our <Link href="/guides">travel guides</Link> are written by the {DEFAULT_AUTHOR} and based on our own fare
            data, such as which day of the week is cheapest to fly or which airport has the lowest fares. Each guide says
            when its data was collected and how we measured it.
          </p>

          <h2>What we are not</h2>
          <p>
            {SITE_NAME} is not an airline or a travel agency, and we are not affiliated with any airline. Bookings,
            changes, refunds and support are handled by the airline or agency you book with.
          </p>

          <h2>Contact us</h2>
          <p>
            Spotted a wrong fare, or have a question about the site? Email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. For a booking you&apos;ve already made, contact the
            airline or agency you booked with, as we can&apos;t see or change bookings.
          </p>
        </div>
      </div>
    </main>
  );
}
