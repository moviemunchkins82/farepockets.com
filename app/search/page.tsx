import type { Metadata } from "next";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { listGuides } from "@/lib/content/guides";
import { buildSubId, buildWidgetFallback, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import PageHeader from "@/components/layout/PageHeader";
import SectionHeader from "@/components/home/SectionHeader";
import RouteCard from "@/components/routes/RouteCard";
import GuideGrid from "@/components/guides/GuideGrid";
import { byPrice } from "@/lib/prices";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./page.module.css";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Search flights",
  description: "Search and compare flight prices, then book with our travel partner Aviasales.",
  alternates: { canonical: "/search" },
};

export default async function SearchPage() {
  const widgetSubId = buildSubId("search_widget");
  const src = buildWidgetSrc(widgetSubId);
  const fallback = buildWidgetFallback(widgetSubId);
  const routes = (await listActiveRoutes()).filter((r) => r.cheapest_price !== null).sort(byPrice);
  // Cheapest route per destination, so the list shows six different places.
  const popular: RouteRow[] = [];
  for (const r of routes) {
    if (popular.length < 6 && !popular.some((p) => p.destination_city === r.destination_city)) popular.push(r);
  }
  const guides = listGuides().slice(0, 2);

  return (
    <main>
      <PageHeader
        title="Search flights"
        description="Compare fares from airlines and booking sites in one search. Results open on Aviasales, our travel partner."
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Search flights", url: "/search" },
        ]}
      >
        <div className={styles.searchCard}>
          <TravelpayoutsWidget src={src} title="Flight search" fallback={fallback} eager />
        </div>
        <AffiliateDisclosure inverse className={styles.note} />
      </PageHeader>

      {popular.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader
              title="Not sure where to go?"
              description="The cheapest one-way fares on popular routes right now."
              href="/flights"
              linkLabel="All deals"
            />
            <ul className="card-grid">
              {popular.map((route) => (
                <li key={route.slug}>
                  <RouteCard route={route} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section className="section band-surface">
          <div className="container">
            <SectionHeader title="Tips before you search" href="/guides" />
            <GuideGrid guides={guides} />
          </div>
        </section>
      )}
    </main>
  );
}
