import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main>
      <PageHeader
        title="We couldn't find that page"
        description="The route or guide you're looking for may have moved. Try a new search or browse flight deals."
      />
      <section className="section">
        <div className="container" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/search" className="button">
            Search flights
          </Link>
          <Link href="/flights" className="button button-secondary">
            Flight deals
          </Link>
          <Link href="/guides" className="button button-secondary">
            Travel guides
          </Link>
        </div>
      </section>
    </main>
  );
}
