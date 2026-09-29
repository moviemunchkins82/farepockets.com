import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRouteBySlug, listActiveRoutes } from "@/lib/db/queries/routes";
import { routeMetadata } from "@/lib/seo/metadata";
import PriceCard from "@/components/route-page/PriceCard";
import RouteFAQ from "@/components/route-page/RouteFAQ";
import Breadcrumbs from "@/components/route-page/Breadcrumbs";
import { formatPrice } from "@/lib/format";

export const revalidate = 21600; // 6h ISR window — cron refresh cadence drives real freshness

export async function generateStaticParams() {
  const routes = await listActiveRoutes();
  return routes.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) return {};
  return routeMetadata(route);
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const faqItems = [
    {
      question: `How much do flights from ${route.origin_city} to ${route.destination_city} cost?`,
      answer: price
        ? `One-way fares start from ${price}, based on the most recent cached data. Confirm the final price on our partner's site.`
        : `We're updating fare data for this route.`,
    },
  ];

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: `${route.origin_city} to ${route.destination_city}`, url: `/flights/${route.slug}` },
        ]}
      />
      <h1>
        Flights from {route.origin_city} to {route.destination_city}
      </h1>
      <PriceCard route={route} />
      <RouteFAQ items={faqItems} />
    </main>
  );
}
