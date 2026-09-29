import AffiliateLink from "@/components/AffiliateLink";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import { buildDeepLink, buildSubId, pickSearchDate } from "@/lib/travelpayouts/affiliateLinks";
import { formatDate, formatPrice } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";

export default function PriceCard({ route }: { route: RouteRow }) {
  const subId = buildSubId(`route_${route.slug}`);
  const searchDate = pickSearchDate(route.cheapest_depart_date);
  const href = buildDeepLink(route.origin_iata, route.destination_iata, subId, searchDate);
  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const checked = formatDate(route.last_refreshed_at);

  return (
    <section aria-label="Flight price">
      <p>{price ? `From ${price} one-way` : "Price data updating"}</p>
      {checked && (
        <p>
          <small>Prices last checked {checked}</small>
        </p>
      )}
      <AffiliateLink href={href} subId={subId} routeSlug={route.slug}>
        See {route.origin_city} → {route.destination_city} flights on {formatDate(searchDate)}
      </AffiliateLink>
      <AffiliateDisclosure />
    </section>
  );
}
