import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@farepockets.com";
const UPDATED = "November 5, 2026";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `${SITE_NAME} is an independent flight comparison site, not a travel agent. How our fare information works, who you book with, and who to contact.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main>
      <PageHeader
        title="Terms of use"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Terms of use", url: "/terms" },
        ]}
      />
      <div className="container page">
        <div className="prose">
          <p>Last updated {UPDATED}. By using {SITE_NAME}, you agree to these terms.</p>

          <h2>The short version</h2>
          <ul>
            <li>
              {SITE_NAME} is a free flight comparison and information site. We are not an airline, travel agent or
              booking platform, and we never sell tickets or take payments.
            </li>
            <li>
              When you click a deal or search, you leave our site for a third-party travel partner. You book with them
              (or with the airline or agency they list), under their terms.
            </li>
            <li>Our prices are recent snapshots, not live quotes. Always check the final price before you pay.</li>
            <li>For anything about a booking, contact the company you booked with.</li>
          </ul>

          <h2>What we do</h2>
          <p>
            We collect recent fares from third-party sources, show which days and airports have been cheapest, and
            publish travel guides. To search or book, we send you to our travel partner Aviasales, which compares
            airlines and booking sites. We may earn a commission if you book; see{" "}
            <a href="/disclosure">How we make money</a>.
          </p>
          <p>
            We are not a party to any booking. Your contract is with the airline, agency or other provider you choose,
            and their terms, fare rules and cancellation policies apply.
          </p>

          <h2>Prices and information</h2>
          <p>
            Fares on {SITE_NAME} come from recent searches by other travellers and are updated twice a day. A
            price you see here may have changed, sold out or never have been available for your dates, and it may not
            include bags, seats or other fees. The price on the booking site is the one that counts.
          </p>
          <p>
            Our guides and fare data are general information to help you plan. They are not professional advice. Rules
            on visas, passports, health and entry change often, so check official government sources before you
            travel.
          </p>
          <p>
            We work hard to keep everything accurate, but we provide the site and its information &quot;as is&quot;,
            without any promise that it is complete, current or error-free.
          </p>

          <h2>Bookings, changes and refunds</h2>
          <p>
            We cannot see, change, cancel or refund bookings. For tickets, payments, schedule changes, cancellations,
            refunds, baggage or complaints, contact the travel partner, agency or airline you booked with.
          </p>

          <h2>Other websites</h2>
          <p>
            Our links take you to websites we don&apos;t own or control. Their own terms and privacy policies apply, and
            we are not responsible for their content, services, prices or conduct.
          </p>

          <h2>Our responsibility to you</h2>
          <p>
            {SITE_NAME} is free to use. As far as the law allows, we are not responsible for any loss or cost that comes
            from using the site, relying on its information, or dealing with a third party you found through it. That
            includes, for example, price changes, unavailable fares, schedule changes, cancellations, missed
            connections, refused boarding or entry, and problems with a booking or payment.
          </p>
          <p>
            Nothing in these terms limits any rights you have that cannot be limited by law, or our responsibility for
            anything that cannot be excluded by law.
          </p>

          <h2>Using the site</h2>
          <p>
            You&apos;re welcome to use {SITE_NAME} for your own travel planning. Please don&apos;t copy our content in
            bulk, scrape or overload the site with automated tools, or try to break or misuse it. City photos come from
            Unsplash and belong to their photographers.
          </p>
          <p>
            We may change, pause or stop any part of the site at any time, and we can&apos;t promise it will always be
            available.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The date at the top shows the latest version, and using the
            site after a change means you accept it.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about the site or these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also
            our <a href="/privacy">privacy policy</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
