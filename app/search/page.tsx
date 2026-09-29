import type { Metadata } from "next";
import Link from "next/link";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import PageHeader from "@/components/layout/PageHeader";
import { buildSubId, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";

export const metadata: Metadata = {
  title: "Search flights",
  description: "Search and compare US flight prices, then book with our travel partner Aviasales.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  const src = buildWidgetSrc(buildSubId("search_widget"));

  return (
    <main>
      <PageHeader
        title="Search flights"
        description="Enter your trip to compare fares from airlines and booking sites. Results open on Aviasales, our travel partner."
      />
      <section className="section">
        <div className="container">
          <TravelpayoutsWidget src={src} title="Flight search" />
          <div style={{ marginTop: 12 }}>
            <AffiliateDisclosure />
          </div>
          <p style={{ marginTop: 24, color: "var(--text-2)" }}>
            Not sure where to go?{" "}
            <Link href="/#deals" className="text-link">
              Browse flight deals
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
