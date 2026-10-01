import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { AirplaneTilt } from "@phosphor-icons/react/ssr";
import { getGuide, listGuideSlugs, listGuides } from "@/lib/content/guides";
import { getAuthor } from "@/lib/content/authors";
import { getCityImage } from "@/lib/cityImages";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { guideMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/schema";
import { formatDate } from "@/lib/format";
import { buildSubId, buildWidgetSrc } from "@/lib/travelpayouts/affiliateLinks";
import Breadcrumbs from "@/components/route-page/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import SectionHeader from "@/components/home/SectionHeader";
import GuideCard from "@/components/guides/GuideCard";
import ShareButtons from "@/components/guides/ShareButtons";
import SidebarDeals from "@/components/guides/SidebarDeals";
import TravelpayoutsWidget from "@/components/search/TravelpayoutsWidget";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./page.module.css";

// The sidebar shows live cached fares, refreshed with the route pages.
export const revalidate = 21600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";

export function generateStaticParams() {
  return listGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return guideMetadata(guide);
}

// Cheapest route per destination, so the sidebar shows three different places.
async function loadSidebarDeals(): Promise<RouteRow[]> {
  try {
    const routes = (await listActiveRoutes())
      .filter((r) => r.cheapest_price !== null)
      .sort((a, b) => Number(a.cheapest_price) - Number(b.cheapest_price));
    const picked: RouteRow[] = [];
    for (const r of routes) {
      if (picked.length < 3 && !picked.some((p) => p.destination_city === r.destination_city)) picked.push(r);
    }
    return picked;
  } catch (error) {
    console.error("guide sidebar: failed to load routes", error);
    return [];
  }
}

// Guides link internally to route pages (/flights/[slug]) or /search; the
// affiliate click happens there or in the sidebar search form, not in MDX.
export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const author = getAuthor(guide.author);
  const photo = guide.image ? getCityImage(guide.image) : null;
  const published = formatDate(guide.publishedAt);
  const updated = guide.updatedAt && guide.updatedAt !== guide.publishedAt ? formatDate(guide.updatedAt) : null;
  const path = `/guides/${guide.slug}`;
  const deals = await loadSidebarDeals();
  const widgetSrc = buildWidgetSrc(buildSubId(`guide_${guide.slug}`));
  const more = listGuides()
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 3);

  return (
    <main>
      <JsonLd
        data={articleSchema({
          title: guide.title,
          description: guide.description,
          url: path,
          imageUrl: photo?.src.src ?? null,
          publishedAt: guide.publishedAt,
          updatedAt: guide.updatedAt,
          author,
        })}
      />
      <div className={`container ${styles.top}`}>
        <Breadcrumbs
          items={[
            { name: "Home", url: "/" },
            { name: "Guides", url: "/guides" },
            { name: guide.title, url: path },
          ]}
        />
      </div>

      <div className={`container ${styles.layout}`}>
        <article className={styles.article}>
          <header className={styles.header}>
            {guide.category && <p className={styles.kicker}>{guide.category}</p>}
            <h1 className={styles.title}>{guide.title}</h1>
            <div className={styles.metaRow}>
              <p className={styles.meta}>
                <span className={styles.author}>by {author.name}</span>
                {published && <time dateTime={guide.publishedAt}>{published}</time>}
                {updated && guide.updatedAt && (
                  <span>
                    Updated <time dateTime={guide.updatedAt}>{updated}</time>
                  </span>
                )}
                <span>{guide.readingMinutes} min read</span>
              </p>
              <ShareButtons url={`${SITE_URL}${path}`} title={guide.title} />
            </div>
          </header>

          <p className={styles.lead}>{guide.description}</p>

          {photo && (
            <figure className={styles.figure}>
              <div className={styles.photo}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  preload
                  placeholder="blur"
                  sizes="(max-width: 1023px) 100vw, 760px"
                  className={styles.img}
                />
              </div>
              <figcaption>
                Photo by{" "}
                <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {photo.photographer}
                </a>{" "}
                on Unsplash
              </figcaption>
            </figure>
          )}

          <div className={`prose ${styles.body}`}>
            <MDXRemote source={guide.content} />
          </div>

          {guide.tags.length > 0 && (
            <ul className={styles.tags} aria-label="Topics">
              {guide.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}

          <section className={styles.authorBox} aria-label="About the author">
            <span className={styles.avatar} aria-hidden="true">
              {author.type === "Organization" ? (
                <AirplaneTilt size={24} weight="fill" />
              ) : (
                author.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
              )}
            </span>
            <div>
              <p className={styles.authorName}>{author.name}</p>
              {author.bio && <p className={styles.authorBio}>{author.bio}</p>}
            </div>
          </section>
        </article>

        <aside className={styles.sidebar} aria-label="Find flights">
          {deals.length > 0 && <SidebarDeals routes={deals} />}
          <div className={styles.sticky}>
            <div className={styles.searchCard}>
              <h2 className={styles.searchTitle}>Search cheap flights</h2>
              <p className={styles.searchText}>Compare airlines and booking sites in one search.</p>
              <TravelpayoutsWidget src={widgetSrc} title="Flight search" />
              <AffiliateDisclosure className={styles.note} />
            </div>
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section className="section band-surface">
          <div className="container">
            <SectionHeader title="More travel guides" href="/guides" />
            <ul className={styles.moreGrid}>
              {more.map((g) => (
                <li key={g.slug}>
                  <GuideCard
                    guide={g}
                    photo={g.image ? (getCityImage(g.image)?.src ?? null) : null}
                    headingLevel="h3"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
