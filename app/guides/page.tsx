import Link from "next/link";
import type { Metadata } from "next";
import { listGuideSlugs, getGuide } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Travel guides",
  description: "Destination guides and flight tips.",
};

export default function GuidesIndex() {
  const guides = listGuideSlugs()
    .map((slug) => getGuide(slug))
    .filter((g): g is NonNullable<typeof g> => g !== null);

  return (
    <main>
      <h1>Travel guides</h1>
      <ul>
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
