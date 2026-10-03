import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `${SITE_NAME} privacy policy.`,
  alternates: { canonical: "/privacy" },
};

// DRAFT — factually accurate to what the app actually collects (see
// lib/db/schema.ts click_events, lib/analytics/*), but this is not legal
// advice. Have this reviewed by a lawyer before launch, especially for
// CCPA (California users) since the plan targets US traffic broadly.
export default function PrivacyPage() {
  return (
    <main>
      <PageHeader
        title="Privacy policy"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Privacy policy", url: "/privacy" },
        ]}
      />
      <div className="container page">
        <div className="prose">
          <p>
            <strong>Draft — pending legal review before launch.</strong>
          </p>
          <p>
            {SITE_NAME} does not collect names or payment information. We do not process bookings or payments — those
            happen on our travel partners&apos; sites, under their own privacy policies.
          </p>
          <h2>Deal alerts</h2>
          <p>
            If you sign up for deal alerts, we store your email address, the departure city you chose (if any), the page
            you signed up on, when you signed up and the wording you agreed to. We use your email address only to send
            you {SITE_NAME} deal alerts, and we never sell or share it. When we start sending alerts we will use an email
            service provider to deliver them on our behalf.
          </p>
          <p>
            Every alert will include a link to unsubscribe, and once you unsubscribe we stop emailing you. To block
            automated sign-ups, we also keep a one-way scrambled (hashed) form of your IP address with your sign-up; we
            don&apos;t store the address itself.
          </p>
          <h2>Clicks to our partners</h2>
          <p>
            We use an anonymous, randomly generated session identifier (stored in your browser&apos;s local storage) to
            understand which pages lead to a click-through to a partner site. This identifier is not linked to your
            email address or any other information about you. We keep these click records for 13 months, then delete
            them.
          </p>
          <p>
            We use Google Analytics (GA4) and Mixpanel to understand site traffic and which pages perform well. Both
            may set their own cookies or use browser storage per their own privacy policies.
          </p>
          <p>
            See <a href="/disclosure">How we make money</a> for how our travel partner links work.
          </p>
        </div>
      </div>
    </main>
  );
}
