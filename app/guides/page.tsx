import type { Metadata } from "next";
import { listGuideSlugs, getGuide } from "@/lib/content/guides";
import PageHeader from "@/components/layout/PageHeader";
import GuideList from "@/components/guides/GuideList";

export const metadata: Metadata = {
  title: "Travel guides",
  description: "Practical tips for finding and booking cheaper US flights.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  const guides = listGuideSlugs()
    .map((slug) => getGuide(slug))
    .filter((g): g is NonNullable<typeof g> => g !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <main>
      <PageHeader title="Travel guides" description="Practical tips for finding and booking cheaper US flights." />
      <section className="section">
        <div className="container">
          {guides.length > 0 ? (
            <GuideList guides={guides} />
          ) : (
            <p style={{ color: "var(--text-2)" }}>New guides are on the way.</p>
          )}
        </div>
      </section>
    </main>
  );
}
