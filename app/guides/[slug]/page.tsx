import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { getGuide, listGuideSlugs, listGuides } from "@/lib/content/guides";
import { guideMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/format";
import SectionHeader from "@/components/home/SectionHeader";
import GuideGrid from "@/components/guides/GuideGrid";
import PageHeader from "@/components/layout/PageHeader";
import styles from "./page.module.css";

export function generateStaticParams() {
  return listGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return guideMetadata(guide.title, guide.description, guide.slug);
}

// Guides link internally to route pages (/flights/[slug]) or /search per the
// internal-linking plan — the affiliate click itself happens there, not in
// guide content, so no AffiliateLink wiring is needed in MDX.
export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const published = formatDate(guide.publishedAt);
  const more = listGuides()
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 2);

  return (
    <main>
      <PageHeader
        title={guide.title}
        description={guide.description}
        kicker={[guide.category, published].filter(Boolean).join(" · ")}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Guides", url: "/guides" },
          { name: guide.title, url: `/guides/${guide.slug}` },
        ]}
      />
      <article className="container page">
        <div className="prose">
          <MDXRemote source={guide.content} />
        </div>
        <aside className={styles.cta}>
          <div>
            <h2>Ready to compare fares?</h2>
            <p>Search your trip and book with our partner Aviasales.</p>
          </div>
          <Link href="/search" className="button">
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            Search flights
          </Link>
        </aside>
      </article>

      {more.length > 0 && (
        <section className="section band-surface">
          <div className="container">
            <SectionHeader title="More travel guides" href="/guides" />
            <GuideGrid guides={more} />
          </div>
        </section>
      )}
    </main>
  );
}
