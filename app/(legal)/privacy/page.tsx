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
const UPDATED = "November 5, 2026";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `${SITE_NAME} has no accounts or sign-up forms and never asks for your name or payment details. What our partners and hosting see, and your choices.`,
  alternates: { canonical: "/privacy" },
};

// Describes what the site actually does: no accounts or forms; the Aviasales
// search widget and partner links; Cloudflare hosting (including its bot-check
// cookie); analytics only once configured. Update it when any of that changes.
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
          <p>Last updated {UPDATED}.</p>

          <h2>The short version</h2>
          <ul>
            <li>You can use {SITE_NAME} without an account, and we never ask for your name, email or payment details.</li>
            <li>
              Searching and booking happen on our travel partners&apos; websites, which handle your information under
              their own privacy policies.
            </li>
            <li>We don&apos;t sell your data, and we don&apos;t show ads.</li>
          </ul>

          <h2>Who we are</h2>
          <p>
            {SITE_NAME} is an independent flight comparison and information site. We show recent fares and travel
            guides, and link you to our travel partner Aviasales to search and book. Questions about this policy:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>

          <h2>What we collect</h2>
          <p>
            Very little. There are no accounts, sign-up forms or newsletters. If you email us, we use your message and
            email address only to reply.
          </p>
          {ANALYTICS.length > 0 ? (
            <p>
              We use {ANALYTICS.join(" and ")} to see how many people visit, which pages they read and which deals they
              click. These tools use cookies or your browser&apos;s storage and a random identifier that isn&apos;t
              linked to your name or contact details.
            </p>
          ) : (
            <p>We don&apos;t use analytics or advertising cookies of our own.</p>
          )}

          <h2>Search forms and partner links</h2>
          <p>
            The flight search form on our pages is provided by Travelpayouts and Aviasales and loads from their
            servers. When you search or click a deal, you go to Aviasales through a Travelpayouts link so that we can be
            credited if you book. These companies may use cookies and record details such as your IP address, device
            and searches, as explained in the{" "}
            <a href="https://support.travelpayouts.com/hc/en-us/articles/360004121052/" rel="noopener noreferrer">
              Travelpayouts privacy policy
            </a>{" "}
            and the{" "}
            <a href="https://www.aviasales.com/privacy" rel="noopener noreferrer">
              Aviasales privacy policy
            </a>
            . Once you leave {SITE_NAME}, the website you are on is responsible for your information, not us.
          </p>

          <h2>Hosting, security and cookies</h2>
          <p>
            The site is hosted by Cloudflare, which handles your IP address and basic request details to deliver pages
            and protect the site from attacks. Cloudflare may set a small security cookie to tell real visitors from
            bots; it is needed for the site to work safely and isn&apos;t used for advertising. See the{" "}
            <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener noreferrer">
              Cloudflare privacy policy
            </a>
            .
          </p>
          <p>
            Our photos and fonts are served from our own site, and the share buttons on guides are plain links that
            load nothing from social networks unless you click them. You can block or delete cookies in your browser
            settings; the site will still work, though partner search forms may not.
          </p>

          <h2>Your choices and rights</h2>
          <p>
            Depending on where you live, you may have the right to ask what personal data is held about you, and to
            have it corrected or deleted. We hold almost none ourselves, so questions about searches or bookings are
            best sent to Travelpayouts, Aviasales or the company you booked with. For anything else, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>

          <h2>Children</h2>
          <p>{SITE_NAME} is not aimed at children under 16, and we don&apos;t knowingly collect their data.</p>

          <h2>Changes</h2>
          <p>
            If we change how the site handles data, we&apos;ll update this page and the date at the top.
          </p>
        </div>
      </div>
    </main>
  );
}
