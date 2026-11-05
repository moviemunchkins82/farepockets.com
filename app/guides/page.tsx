import type { Metadata } from "next";
import { listGuides, toSummary } from "@/lib/content/guides";
import { getCityImage } from "@/lib/cityImages";
import Breadcrumbs from "@/components/route-page/Breadcrumbs";
import FeaturedGuide from "@/components/guides/FeaturedGuide";
import GuideBrowser from "@/components/guides/GuideBrowser";
import styles from "./page.module.css";

const DESCRIPTION =
  "Practical tips for finding and booking cheaper flights, based on our own fare data: which airport to fly from, which day to go and when to book.";

export const metadata: Metadata = {
  title: "Cheap flight tips and travel guides",
  description:
    "Tips for cheaper flights from our own fare data: the cheapest day to fly, when to book and which airport to use, plus guides to Turkey and Central Asia.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  const guides = listGuides().map(toSummary);
  const [featured] = guides;
  const items = guides.map((guide) => ({
    guide,
    photo: guide.image ? (getCityImage(guide.image)?.src ?? null) : null,
  }));

  return (
    <main className={styles.main}>
      <div className="container">
        <Breadcrumbs
          items={[
            { name: "Home", url: "/" },
            { name: "Guides", url: "/guides" },
          ]}
        />
        <header className={styles.head}>
          <h1>Travel guides</h1>
          <p>{DESCRIPTION}</p>
        </header>

        {featured ? (
          <>
            <FeaturedGuide guide={featured} />
            {guides.length > 1 && (
              <section className={styles.browse} aria-label="All guides">
                <GuideBrowser items={items} featuredSlug={featured.slug} />
              </section>
            )}
          </>
        ) : (
          <p className={styles.empty}>New guides are on the way.</p>
        )}
      </div>
    </main>
  );
}
