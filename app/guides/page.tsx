import type { Metadata } from "next";
import { listGuides, toSummary } from "@/lib/content/guides";
import { getCityImage } from "@/lib/cityImages";
import Breadcrumbs from "@/components/route-page/Breadcrumbs";
import FeaturedGuide from "@/components/guides/FeaturedGuide";
import GuideBrowser from "@/components/guides/GuideBrowser";
import styles from "./page.module.css";

const DESCRIPTION = "Practical, data-backed tips for finding and booking cheaper US flights.";

export const metadata: Metadata = {
  title: "Travel guides",
  description: DESCRIPTION,
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
