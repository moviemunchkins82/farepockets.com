"use client";

import { useEffect, useRef, useState } from "react";
import WidgetSkeleton from "@/components/search/WidgetSkeleton";

interface TravelpayoutsWidgetProps {
  src: string;
  title: string;
}

// Lazy-loads the White Label search widget iframe only once it's scrolled
// into view (or immediately if already in view on mount) — protects LCP,
// and the skeleton's fixed height protects CLS until the iframe replaces it.
export default function TravelpayoutsWidget({ src, title }: TravelpayoutsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {shouldLoad && src !== "#" ? (
        <iframe src={src} title={title} width="100%" height={400} style={{ border: 0 }} loading="lazy" />
      ) : (
        <WidgetSkeleton />
      )}
    </div>
  );
}
