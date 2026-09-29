"use client";

import { useEffect, useRef, useState } from "react";
import WidgetSkeleton from "@/components/search/WidgetSkeleton";

interface TravelpayoutsWidgetProps {
  src: string;
  title: string;
}

// Travelpayouts search widgets are <script async src="https://tp.media/content?...">
// embeds that render the form next to the script tag — not iframe-able pages.
// The script is injected only once the container nears the viewport (protects LCP),
// and the skeleton reserves the widget's height (protects CLS).
export default function TravelpayoutsWidget({ src, title }: TravelpayoutsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [rendered, setRendered] = useState(false);
  const configured = src !== "#";

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !configured) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [configured]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!inView || !mount || !configured) return;

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.charset = "utf-8";
    mount.appendChild(script);

    // The widget first inserts an empty shadow-DOM host, then draws the form a
    // frame or two later — wait for real height before dropping the skeleton.
    const resize = new ResizeObserver(() => {
      if (mount.getBoundingClientRect().height > 50) {
        setRendered(true);
        resize.disconnect();
      }
    });
    resize.observe(mount);

    return () => {
      resize.disconnect();
      mount.replaceChildren();
    };
  }, [inView, src, configured]);

  return (
    <div ref={containerRef} aria-label={title} className="tp-widget" style={{ position: "relative" }}>
      <div ref={mountRef} />
      {!rendered && <WidgetSkeleton configured={configured} />}
    </div>
  );
}
