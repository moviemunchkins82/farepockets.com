import type { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export const metadata: Metadata = {
  title: "How we make money",
  description: `How ${SITE_NAME} earns commission and what that means for you.`,
  alternates: { canonical: "/disclosure" },
};

export default function DisclosurePage() {
  return (
    <main className="container page">
      <div className="prose">
      <h1>How we make money</h1>
      <p>
        {SITE_NAME} does not sell flights directly. When you click a &quot;Search flights&quot; or booking link on
        this site, you&apos;re taken to one of our travel partners to complete your search and booking. If you book
        through that link, we may earn a commission from the partner — at no extra cost to you.
      </p>
      <p>
        We never process payments, issue tickets, or handle booking changes, cancellations, or refunds. All of
        that is handled directly by the partner site you book through — contact them for anything related to an
        existing booking.
      </p>
      <p>
        Prices shown on this site are cached and may not reflect the exact final price at checkout. Always confirm
        the total price on the partner&apos;s site before completing a booking.
      </p>
      </div>
    </main>
  );
}
