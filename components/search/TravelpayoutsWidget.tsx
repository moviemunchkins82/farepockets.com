"use client";

import { useEffect, useRef, useState } from "react";
import { preconnect, preload } from "react-dom";
import WidgetSkeleton from "@/components/search/WidgetSkeleton";
import WidgetFallback from "@/components/search/WidgetFallback";
import type { WidgetFallback as WidgetFallbackLink } from "@/lib/travelpayouts/affiliateLinks";

// If the form hasn't drawn by then (slow network, or blocked by an ad blocker
// without an error event), offer a direct partner link instead.
const FALLBACK_AFTER_MS = 8000;

interface TravelpayoutsWidgetProps {
  src: string;
  title: string;
  // Partner link shown if the widget fails to load.
  fallback: WidgetFallbackLink;
  // For widgets near the top of the page: fetch the script while the HTML is
  // still loading, instead of after hydration once the widget scrolls into view.
  eager?: boolean;
}

// Travelpayouts search widgets are <script async src="https://tpwgts.com/content?...">
// embeds that render the form next to the script tag — not iframe-able pages.
// Lazy widgets inject the script once the container nears the viewport (protects LCP);
// a form-shaped skeleton reserves the widget's height meanwhile (protects CLS).
export default function TravelpayoutsWidget({ src, title, fallback, eager = false }: TravelpayoutsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(eager);
  const [rendered, setRendered] = useState(false);
  const [failed, setFailed] = useState(false);
  const configured = src !== "#";

  // Resource hints are hoisted into <head> (including during server rendering).
  if (configured) {
    preconnect(new URL(src).origin);
    if (eager) preload(src, { as: "script" });
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !configured || eager) return;

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
  }, [configured, eager]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!inView || !mount || !configured) return;

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.charset = "utf-8";
    // Blocked requests (ad blockers, privacy browsers) fire an error event.
    script.onerror = () => setFailed(true);
    mount.appendChild(script);
    const timer = setTimeout(() => setFailed(true), FALLBACK_AFTER_MS);

    // The widget first inserts an empty shadow-DOM host, then draws the form a frame
    // or two later. The mount has a reserved min-height, so measure the widget's own
    // elements (not the mount) before dropping the skeleton.
    const contentHeight = () =>
      Array.from(mount.children).reduce((sum, child) => sum + child.getBoundingClientRect().height, 0);

    // The form lives in an open shadow root and hard-codes 'Open Sans'. Page CSS
    // can't reach it, but CSS variables inherit through, so point it at the site font.
    const applySiteFont = () => {
      for (const child of Array.from(mount.children)) {
        const root = child.shadowRoot;
        if (!root || root.querySelector("style[data-fp-font]")) continue;
        const style = document.createElement("style");
        style.setAttribute("data-fp-font", "");
        style.textContent =
          ".cascoon, .app { font-family: var(--font-sans) !important; } input, button, select, textarea { font-family: inherit !important; }";
        root.appendChild(style);
      }
    };

    const resize = new ResizeObserver(() => {
      applySiteFont();
      if (contentHeight() > 50) {
        // A late load still wins over the fallback link.
        setRendered(true);
        clearTimeout(timer);
        resize.disconnect();
        mutations.disconnect();
      }
    });
    const mutations = new MutationObserver(() => {
      applySiteFont();
      for (const child of Array.from(mount.children)) resize.observe(child);
    });
    mutations.observe(mount, { childList: true });

    return () => {
      clearTimeout(timer);
      resize.disconnect();
      mutations.disconnect();
      mount.replaceChildren();
    };
  }, [inView, src, configured]);

  return (
    <div
      ref={containerRef}
      aria-label={title}
      aria-busy={!rendered && !failed}
      className="tp-widget"
      data-rendered={rendered || undefined}
      style={{ position: "relative" }}
    >
      <div ref={mountRef} className="tp-mount" />
      {!rendered &&
        (failed ? <WidgetFallback link={fallback} /> : <WidgetSkeleton configured={configured} />)}
    </div>
  );
}
