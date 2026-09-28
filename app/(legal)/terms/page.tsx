import type { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `${SITE_NAME} terms of use.`,
};

// DRAFT — not legal advice. Have this reviewed by a lawyer before launch.
export default function TermsPage() {
  return (
    <main>
      <h1>Terms of use</h1>
      <p>
        <strong>Draft — pending legal review before launch.</strong>
      </p>
      <p>
        {SITE_NAME} is a flight search and comparison site. We are not a travel agency, airline, or ticket seller.
        We do not sell flights, process payments, or issue tickets. All bookings are made directly with the
        travel partner you&apos;re redirected to, under that partner&apos;s own terms, fare rules, and cancellation
        policies.
      </p>
      <p>
        Fare and price information on this site is provided by third-party data sources and cached periodically.
        It may not reflect the final price at checkout — always confirm pricing on the partner&apos;s site before
        booking.
      </p>
      <p>
        For anything related to an existing booking — changes, cancellations, refunds, or support — contact the
        travel partner you booked through directly, not {SITE_NAME}.
      </p>
      <p>
        See <a href="/disclosure">How we make money</a> and our <a href="/privacy">privacy policy</a>.
      </p>
    </main>
  );
}
