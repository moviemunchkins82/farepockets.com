import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@farepockets.com";
// Analytics only load when configured and the site is public (see app/layout.tsx),
// so the policy describes them only then.
const ANALYTICS_ON = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
const ANALYTICS = [
  ANALYTICS_ON && process.env.NEXT_PUBLIC_GA4_ID && "Google Analytics",
  ANALYTICS_ON && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN && "Mixpanel",
].filter((name): name is string => !!name);
const UPDATED = "November 4, 2026";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `What ${SITE_NAME} collects when you use the site (no names or payment details), which tools we use and your choices.`,
  alternates: { canonical: "/privacy" },
};

// DRAFT. Describes what the site actually does (no accounts or forms; the
// Aviasales search widget and partner links; Cloudflare hosting; analytics only
// once configured), but it is not legal advice. Have it reviewed before launch,
// for UK/EU GDPR and cookie rules (PECR) and US state laws such as the CCPA.
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
          <p>Last updated {UPDATED}.</p>

          <h2>Who we are</h2>
          <p>
            {SITE_NAME} is a flight comparison site. We show recent fares and link you to our travel partner Aviasales,
            where you search and book. Questions about this policy or your data:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>

          <h2>What we collect</h2>
          <p>
            {SITE_NAME} has no accounts, sign-up forms or newsletters, and we never ask for your name, email address or
            payment details. Bookings and payments happen on our partners&apos; sites, under their own privacy
            policies.
          </p>
          {ANALYTICS.length > 0 ? (
            <p>
              We use {ANALYTICS.join(" and ")} to understand how many people visit, which pages they read and which
              deals they click. These tools use cookies or your browser&apos;s storage and an anonymous, randomly
              generated identifier, which is not linked to your name or contact details.
            </p>
          ) : (
            <p>We don&apos;t use analytics or advertising cookies of our own.</p>
          )}

          <h2>The flight search form and partner links</h2>
          <p>
            The flight search form on our pages is provided by Travelpayouts and Aviasales and loads from their
            servers. When you click a deal or search, you go to Aviasales through a Travelpayouts link so that we can
            be credited for any booking. Both companies may set cookies and record details such as your IP address,
            device and the searches you make, as described in the{" "}
            <a href="https://support.travelpayouts.com/hc/en-us/articles/360004121052/" rel="noopener noreferrer">
              Travelpayouts privacy policy
            </a>{" "}
            and the{" "}
            <a href="https://www.aviasales.com/privacy" rel="noopener noreferrer">
              Aviasales privacy policy
            </a>
            . See <a href="/disclosure">How we make money</a> for how these links work.
          </p>

          <h2>Hosting and security</h2>
          <p>
            The site is hosted by Cloudflare, which processes your IP address and basic request details to deliver
            pages and protect the site from attacks. See the{" "}
            <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener noreferrer">
              Cloudflare privacy policy
            </a>
            . Our photos and fonts are served from our own site, and the share buttons on guides are plain links that
            load nothing from social networks until you click them.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on where you live, you may have the right to ask what personal data is held about you, to have it
            corrected or deleted, and to object to its use. As we hold no personal data ourselves, requests about
            searches or bookings are best sent to Travelpayouts or Aviasales; for anything else, email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. In the UK you can also complain to the
            Information Commissioner&apos;s Office (ico.org.uk).
          </p>

          <h2>Children</h2>
          <p>{SITE_NAME} is not aimed at children under 16, and we don&apos;t knowingly collect their data.</p>

          <h2>Changes</h2>
          <p>If we change how the site handles data, we&apos;ll update this page and the date at the top.</p>
        </div>
      </div>
    </main>
  );
}
