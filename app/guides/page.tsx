import type { Metadata } from "next";
import { listGuides } from "@/lib/content/guides";
import PageHeader from "@/components/layout/PageHeader";
import GuideGrid from "@/components/guides/GuideGrid";

export const metadata: Metadata = {
  title: "Travel guides",
  description: "Practical, data-backed tips for finding and booking cheaper US flights.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  const guides = listGuides();

  return (
    <main>
      <PageHeader
        title="Travel guides"
        description="Practical, data-backed tips for finding and booking cheaper US flights."
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Guides", url: "/guides" },
        ]}
      />
      <section className="section">
        <div className="container">
          {guides.length > 0 ? (
            <GuideGrid guides={guides} />
          ) : (
            <p style={{ color: "var(--text-2)" }}>New guides are on the way.</p>
          )}
        </div>
      </section>
    </main>
  );
}
