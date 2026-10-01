"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadersHorizontal, X } from "@phosphor-icons/react";
import { getCityImage } from "@/lib/cityImages";
import { citySlug } from "@/lib/cities";
import styles from "./DealsExplorer.module.css";

export interface DealItem {
  slug: string;
  originCity: string;
  originCode: string;
  destinationCity: string;
  destinationCode: string;
  price: number | null;
  departDate: string | null; // yyyy-mm-dd
}

type Sort = "price" | "date" | "name";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthName = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

function monthOf(d: string | null): string | null {
  return d ? d.slice(0, 7) : null;
}

function monthLabel(month: string): string {
  return monthName.format(new Date(`${month}-01T00:00:00Z`));
}

function counts(items: DealItem[], key: "originCity" | "destinationCity") {
  const map = new Map<string, number>();
  for (const item of items) map.set(item[key], (map.get(item[key]) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const COLLAPSED_CITIES = 6;

function CityGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: [string, number][];
  selected: string[];
  onToggle: (city: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  // Selected cities stay visible even when the list is collapsed.
  const visible = expanded
    ? options
    : options.filter(([city], i) => i < COLLAPSED_CITIES || selected.includes(city));

  return (
    <fieldset className={styles.group}>
      <legend>{legend}</legend>
      <div className={styles.options}>
        {visible.map(([city, n]) => (
          <label key={city} className={styles.check}>
            <input type="checkbox" checked={selected.includes(city)} onChange={() => onToggle(city)} />
            <span>{city}</span>
            <span className={styles.count}>{n}</span>
          </label>
        ))}
      </div>
      {options.length > COLLAPSED_CITIES && (
        <button type="button" className={styles.more} onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
          {expanded ? "Show fewer" : `Show all ${options.length}`}
        </button>
      )}
    </fieldset>
  );
}

export default function DealsExplorer({ deals }: { deals: DealItem[] }) {
  const priceCeiling = useMemo(() => {
    const max = Math.max(0, ...deals.map((d) => d.price ?? 0));
    return Math.max(50, Math.ceil(max / 10) * 10);
  }, [deals]);
  const fromOptions = useMemo(() => counts(deals, "originCity"), [deals]);
  const toOptions = useMemo(() => counts(deals, "destinationCity"), [deals]);
  const monthOptions = useMemo(
    () => [...new Set(deals.map((d) => monthOf(d.departDate)).filter((m): m is string => !!m))].sort(),
    [deals],
  );

  const [from, setFrom] = useState<string[]>([]);
  const [to, setTo] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [sort, setSort] = useState<Sort>("price");
  const [panelOpen, setPanelOpen] = useState(false);

  // Read a shared filter link (?from=new-york&max=100...) once on load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bySlug = (names: [string, number][], key: string) => {
      const wanted = (params.get(key) ?? "").split(",").filter(Boolean);
      return names.map(([name]) => name).filter((name) => wanted.includes(citySlug(name)));
    };
    const max = Number(params.get("max"));
    const sortParam = params.get("sort");
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the URL after hydration */
    setFrom(bySlug(fromOptions, "from"));
    setTo(bySlug(toOptions, "to"));
    setMonths((params.get("month") ?? "").split(",").filter((m) => monthOptions.includes(m)));
    if (Number.isFinite(max) && max > 0) setMaxPrice(Math.min(max, priceCeiling));
    if (sortParam === "date" || sortParam === "name") setSort(sortParam);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fromOptions, toOptions, monthOptions, priceCeiling]);

  // Keep the URL shareable without reloading the page.
  useEffect(() => {
    const params = new URLSearchParams();
    if (from.length) params.set("from", from.map(citySlug).join(","));
    if (to.length) params.set("to", to.map(citySlug).join(","));
    if (months.length) params.set("month", months.join(","));
    if (maxPrice < priceCeiling) params.set("max", String(maxPrice));
    if (sort !== "price") params.set("sort", sort);
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", url);
  }, [from, to, months, maxPrice, sort, priceCeiling]);

  const filtered = useMemo(() => {
    const priceActive = maxPrice < priceCeiling;
    const list = deals.filter(
      (d) =>
        (!from.length || from.includes(d.originCity)) &&
        (!to.length || to.includes(d.destinationCity)) &&
        (!months.length || (d.departDate !== null && months.includes(monthOf(d.departDate) as string))) &&
        (!priceActive || (d.price !== null && d.price <= maxPrice)),
    );
    return list.sort((a, b) => {
      if (sort === "name")
        return a.originCity.localeCompare(b.originCity) || a.destinationCity.localeCompare(b.destinationCity);
      if (sort === "date") return (a.departDate ?? "9999").localeCompare(b.departDate ?? "9999");
      return (a.price ?? Infinity) - (b.price ?? Infinity);
    });
  }, [deals, from, to, months, maxPrice, priceCeiling, sort]);

  const activeCount = from.length + to.length + months.length + (maxPrice < priceCeiling ? 1 : 0);
  const reset = () => {
    setFrom([]);
    setTo([]);
    setMonths([]);
    setMaxPrice(priceCeiling);
  };
  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  return (
    <div className={styles.layout}>
      <button
        type="button"
        className={styles.panelToggle}
        aria-expanded={panelOpen}
        aria-controls="deal-filters"
        onClick={() => setPanelOpen((open) => !open)}
      >
        <FadersHorizontal size={18} aria-hidden="true" />
        Filters{activeCount ? ` (${activeCount})` : ""}
      </button>

      <aside id="deal-filters" className={`${styles.sidebar} ${panelOpen ? styles.open : ""}`} aria-label="Filter deals">
        <div className={styles.sidebarHead}>
          <h2>Filters</h2>
          {activeCount > 0 && (
            <button type="button" className={styles.reset} onClick={reset}>
              Reset all
            </button>
          )}
        </div>

        <CityGroup legend="Departure city" options={fromOptions} selected={from} onToggle={(c) => toggle(from, setFrom, c)} />
        <CityGroup legend="Destination" options={toOptions} selected={to} onToggle={(c) => toggle(to, setTo, c)} />

        <fieldset className={styles.group}>
          <legend>Max one-way price</legend>
          <div className={styles.rangeRow}>
            <input
              type="range"
              min={10}
              max={priceCeiling}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-valuetext={maxPrice < priceCeiling ? `Up to ${usd.format(maxPrice)}` : "Any price"}
            />
            <span className={styles.rangeValue}>{maxPrice < priceCeiling ? `Up to ${usd.format(maxPrice)}` : "Any price"}</span>
          </div>
        </fieldset>

        {monthOptions.length > 0 && (
          <fieldset className={styles.group}>
            <legend>Cheapest fare departs</legend>
            <div className={styles.chips}>
              {monthOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.chip} ${months.includes(m) ? styles.chipOn : ""}`}
                  aria-pressed={months.includes(m)}
                  onClick={() => toggle(months, setMonths, m)}
                >
                  {monthLabel(m)}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </aside>

      <div className={styles.results}>
        <div className={styles.toolbar}>
          <p aria-live="polite">
            Showing <strong>{filtered.length}</strong> of {deals.length} routes
          </p>
          <label className={styles.sort}>
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="price">Cheapest first</option>
              <option value="date">Soonest departure</option>
              <option value="name">City name</option>
            </select>
          </label>
        </div>

        {activeCount > 0 && (
          <ul className={styles.activeTags} aria-label="Active filters">
            {[...from.map((c) => ({ label: `From ${c}`, clear: () => toggle(from, setFrom, c) })),
              ...to.map((c) => ({ label: `To ${c}`, clear: () => toggle(to, setTo, c) })),
              ...months.map((m) => ({ label: monthLabel(m), clear: () => toggle(months, setMonths, m) })),
              ...(maxPrice < priceCeiling ? [{ label: `Up to ${usd.format(maxPrice)}`, clear: () => setMaxPrice(priceCeiling) }] : []),
            ].map((tag) => (
              <li key={tag.label}>
                <button type="button" onClick={tag.clear} aria-label={`Remove filter: ${tag.label}`}>
                  {tag.label}
                  <X size={12} weight="bold" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {filtered.length > 0 ? (
          <ul className={styles.grid}>
            {filtered.map((d) => {
              const photo = getCityImage(d.destinationCity);
              return (
                <li key={d.slug}>
                  <Link href={`/flights/${d.slug}`} className={styles.card}>
                    <span className={styles.thumb}>
                      {photo && <Image src={photo.src} alt="" fill sizes="120px" placeholder="blur" className={styles.img} />}
                    </span>
                    <span className={styles.info}>
                      <span className={styles.route}>
                        {d.originCity} to {d.destinationCity}
                      </span>
                      <span className={styles.meta}>
                        {d.originCode} to {d.destinationCode}
                        {d.departDate ? `, departs ${shortDate.format(new Date(`${d.departDate}T00:00:00Z`))}` : ""}
                      </span>
                      <span className={styles.bottom}>
                        <span className={styles.price}>{d.price !== null ? `From ${usd.format(d.price)}` : "Checking fares"}</span>
                        <span className={styles.cta}>View deal</span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>No routes match these filters.</p>
            <button type="button" className="button" onClick={reset}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
