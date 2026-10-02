"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, CaretRight, GlobeHemisphereEast, List, MagnifyingGlass, Tag, X } from "@phosphor-icons/react";
import styles from "./MobileMenu.module.css";

export interface MenuDestination {
  name: string;
  href: string;
  price: string | null;
}

// Must match the breakpoint in Header.module.css / MobileMenu.module.css.
const DESKTOP_QUERY = "(min-width: 640px)";

// Phone-only menu. Search stays first; deals and priced destinations follow,
// since those are the pages that lead to a booking.
export default function MobileMenu({ destinations }: { destinations: MenuDestination[] }) {
  const pathname = usePathname();
  // Remember which page the menu was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = () => setOpenOn(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenOn(null);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onResize = () => {
      if (desktop.matches) setOpenOn(null);
    };

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        {open ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
      </button>

      <div
        id={panelId}
        className={styles.overlay}
        hidden={!open}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <nav className={styles.panel} aria-label="Menu">
          <Link href="/search" className={`button ${styles.search}`} onClick={close}>
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            Search flights
          </Link>

          <ul className={styles.links}>
            <li>
              <Link href="/destinations" className={styles.link} onClick={close}>
                <span className={styles.icon} aria-hidden="true">
                  <GlobeHemisphereEast size={20} />
                </span>
                <span className={styles.linkText}>
                  <span className={styles.linkTitle}>Turkey &amp; the Silk Road</span>
                  <span className={styles.linkDesc}>Istanbul, Tbilisi, Baku, Tashkent and more</span>
                </span>
                <CaretRight size={16} className={styles.caret} aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link href="/flights" className={styles.link} onClick={close}>
                <span className={styles.icon} aria-hidden="true">
                  <Tag size={20} />
                </span>
                <span className={styles.linkText}>
                  <span className={styles.linkTitle}>Flight deals</span>
                  <span className={styles.linkDesc}>Lowest fares, checked twice a day</span>
                </span>
                <CaretRight size={16} className={styles.caret} aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link href="/guides" className={styles.link} onClick={close}>
                <span className={styles.icon} aria-hidden="true">
                  <BookOpenText size={20} />
                </span>
                <span className={styles.linkText}>
                  <span className={styles.linkTitle}>Travel guides</span>
                  <span className={styles.linkDesc}>Tips to pay less for your flight</span>
                </span>
                <CaretRight size={16} className={styles.caret} aria-hidden="true" />
              </Link>
            </li>
          </ul>

          {destinations.length > 0 && (
            <section aria-labelledby={`${panelId}-dest`}>
              <h2 id={`${panelId}-dest`} className={styles.heading}>
                Cheap flights to
              </h2>
              <ul className={styles.destinations}>
                {destinations.map((d) => (
                  <li key={d.href}>
                    <Link href={d.href} className={styles.destination} onClick={close}>
                      <span className={styles.city}>{d.name}</span>
                      {d.price && <span className={styles.price}>from {d.price}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link href="/disclosure" className={styles.small} onClick={close}>
            How we make money
          </Link>
        </nav>
      </div>
    </>
  );
}
