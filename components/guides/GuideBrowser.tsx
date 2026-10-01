"use client";

import { useMemo, useState } from "react";
import type { StaticImageData } from "next/image";
import { ArrowsDownUp } from "@phosphor-icons/react";
import GuideCard from "@/components/guides/GuideCard";
import type { GuideSummary } from "@/lib/content/guides";
import styles from "./GuideBrowser.module.css";

export interface GuideItem {
  guide: GuideSummary;
  photo: StaticImageData | null;
}

type Sort = "newest" | "oldest";

// Category chips and sort for the /guides grid. "All" leaves out the featured
// guide (it's already shown above); picking a category searches every guide.
export default function GuideBrowser({ items, featuredSlug }: { items: GuideItem[]; featuredSlug: string | null }) {
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("newest");

  const categories = useMemo(
    () =>
      [...new Set(items.map(({ guide }) => guide.category).filter((c): c is string => c !== null))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [items],
  );

  const visible = useMemo(() => {
    const list = category
      ? items.filter(({ guide }) => guide.category === category)
      : items.filter(({ guide }) => guide.slug !== featuredSlug);
    return [...list].sort((a, b) => {
      const order = a.guide.publishedAt.localeCompare(b.guide.publishedAt);
      return sort === "newest" ? -order : order;
    });
  }, [items, category, featuredSlug, sort]);

  return (
    <div>
      <div className={styles.toolbar}>
        {categories.length > 1 && (
          <div className={styles.chips} role="group" aria-label="Filter guides by topic">
            <button
              type="button"
              className={styles.chip}
              aria-pressed={category === null}
              onClick={() => setCategory(null)}
            >
              All
            </button>
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                className={styles.chip}
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        <label className={styles.sort}>
          <ArrowsDownUp size={16} aria-hidden="true" />
          <span className="sr-only">Sort guides</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>

      {visible.length > 0 ? (
        <ul className={styles.grid}>
          {visible.map(({ guide, photo }) => (
            <li key={guide.slug}>
              <GuideCard guide={guide} photo={photo} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>More guides on this topic are on the way.</p>
      )}
    </div>
  );
}
