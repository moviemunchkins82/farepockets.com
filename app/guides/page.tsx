import type { Metadata } from "next";
import { listGuides } from "@/lib/content/guides";
import PageHeader from "@/components/layout/PageHeader";
import GuideList from "@/components/guides/GuideList";

export const metadata: Metadata = {
  title: "Travel guides",
  description: "Practical tips for finding and booking cheaper US flights.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  const guides = listGuides();

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
