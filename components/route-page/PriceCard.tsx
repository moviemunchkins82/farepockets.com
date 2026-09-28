import AffiliateLink from "@/components/AffiliateLink";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import { buildDeepLink, buildSubId } from "@/lib/travelpayouts/affiliateLinks";
import type { RouteRow } from "@/lib/db/schema";

export default function PriceCard({ route }: { route: RouteRow }) {
  const subId = buildSubId(`route_${route.slug}`);
  const href = buildDeepLink(route.origin_iata, route.destination_iata, subId);

  return (
    <section aria-label="Flight price">
      <p>
        {route.cheapest_price
          ? `From $${route.cheapest_price} ${route.cheapest_currency}`
          : "Price data updating"}
      </p>
      {route.last_refreshed_at && (
        <p>
          <small>Prices last checked {new Date(route.last_refreshed_at).toLocaleDateString()}</small>
        </p>
      )}
      <AffiliateLink href={href} subId={subId} routeSlug={route.slug}>
        Search flights {route.origin_city} → {route.destination_city}
      </AffiliateLink>
      <AffiliateDisclosure />
    </section>
  );
}
