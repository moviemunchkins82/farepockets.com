import type { Metadata } from "next";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import { buildSubId, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";

export const metadata: Metadata = {
  title: "Search flights",
  description: "Search and compare US flight prices, book with our travel partner.",
};

export default function SearchPage() {
  const subId = buildSubId("search_widget");
  const src = buildWidgetSrc(subId);

  return (
    <main>
      <h1>Search flights</h1>
      <TravelpayoutsWidget src={src} title="Flight search" />
      <AffiliateDisclosure />
    </main>
  );
}
