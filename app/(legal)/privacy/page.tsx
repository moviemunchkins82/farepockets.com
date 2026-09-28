import type { Metadata } from "next";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `${SITE_NAME} privacy policy.`,
};

// DRAFT — factually accurate to what the app actually collects (see
// lib/db/schema.ts click_events, lib/analytics/*), but this is not legal
// advice. Have this reviewed by a lawyer before launch, especially for
// CCPA (California users) since the plan targets US traffic broadly.
export default function PrivacyPage() {
  return (
    <main>
      <h1>Privacy policy</h1>
      <p>
        <strong>Draft — pending legal review before launch.</strong>
      </p>
      <p>
        {SITE_NAME} does not collect names, email addresses, or payment information. We do not process bookings
        or payments — those happen on our travel partners&apos; sites, under their own privacy policies.
      </p>
      <p>
        We use an anonymous, randomly generated session identifier (stored in your browser&apos;s local storage) to
        understand which pages lead to a click-through to a partner site. This identifier is not linked to your
        name or any other personal information we hold, because we hold none.
      </p>
      <p>
        We use Google Analytics (GA4) and Mixpanel to understand site traffic and which pages perform well. Both
        may set their own cookies or use browser storage per their own privacy policies.
      </p>
      <p>
        See <a href="/disclosure">How we make money</a> for how our travel partner links work.
      </p>
    </main>
  );
}
