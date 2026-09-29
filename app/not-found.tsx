import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="container page" style={{ paddingBlock: "96px" }}>
      <div className="prose">
        <h1>We couldn&apos;t find that page</h1>
        <p>The route or guide you&apos;re looking for may have moved. Try a new search or browse popular routes.</p>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <Link href="/search" className="button">
          Search flights
        </Link>
        <Link href="/#deals" className="button button-secondary">
          Flight deals
        </Link>
      </div>
    </main>
  );
}
