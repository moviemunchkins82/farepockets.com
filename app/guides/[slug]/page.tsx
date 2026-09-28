import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getGuide, listGuideSlugs } from "@/lib/content/guides";
import { guideMetadata } from "@/lib/seo/metadata";
import Breadcrumbs from "@/components/route-page/Breadcrumbs";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";

export function generateStaticParams() {
  return listGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return guideMetadata(guide.title, guide.description, guide.slug);
}

// Guides link internally to route pages (/flights/[slug]) or /search per the
// internal-linking plan — the affiliate click itself happens there, not in
// guide content, so no AffiliateLink wiring is needed in MDX.
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <main>
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Guides", url: "/guides" }, { name: guide.title, url: `/guides/${guide.slug}` }]} />
      <h1>{guide.title}</h1>
      <MDXRemote source={guide.content} />
      <AffiliateDisclosure />
    </main>
  );
}
