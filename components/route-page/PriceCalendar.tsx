import AffiliateLink from "@/components/AffiliateLink";
import AffiliateDisclosure from "@/components/layout/AffiliateDisclosure";
import { buildDeepLink, buildSubId } from "@/lib/travelpayouts/affiliateLinks";
import { isPriceCalendarData, type PriceCalendarData } from "@/lib/travelpayouts/types";
import { formatDate, formatLongDate, formatPrice } from "@/lib/format";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./PriceCalendar.module.css";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface Day {
  date: Date;
  iso: string;
  price: number | null;
  past: boolean;
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

function buildMonth(month: string, prices: Map<string, number>, today: number): Day[] {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1, i + 1));
    const iso = date.toISOString().slice(0, 10);
    return { date, iso, price: prices.get(iso) ?? null, past: date.getTime() < today };
  });
}

export function calendarData(route: RouteRow): PriceCalendarData | null {
  return isPriceCalendarData(route.price_calendar) ? route.price_calendar : null;
}

// Cheapest future day per month, for the FAQ ("cheapest month").
export function monthlyLows(calendar: PriceCalendarData, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return calendar.months
    .map(({ month, days }) => {
      const future = days.filter((d) => new Date(`${d.date}T00:00:00Z`).getTime() >= today);
      const low = future.reduce<(typeof future)[number] | null>((min, d) => (!min || d.price < min.price ? d : min), null);
      return low ? { month, label: monthLabel(month).split(" ")[0], date: low.date, price: low.price } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

export default function PriceCalendar({ route, calendar }: { route: RouteRow; calendar: PriceCalendarData }) {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const origin = route.origin_iata.trim();
  const destination = route.destination_iata.trim();
  const subId = buildSubId(`route_${route.slug}_calendar`);
  const link = (date: Date) => buildDeepLink(origin, destination, subId, date);

  const months = calendar.months.map(({ month, days }) => {
    const prices = new Map(days.map((d) => [d.date, d.price]));
    const all = buildMonth(month, prices, today);
    const priced = all.filter((d) => !d.past && d.price !== null).map((d) => d.price as number);
    const min = priced.length ? Math.min(...priced) : null;
    const sorted = [...priced].sort((a, b) => a - b);
    const lowCutoff = sorted.length >= 3 ? sorted[Math.floor(sorted.length / 3)] : null;
    const offset = all[0].date.getUTCDay();
    return { month, all, min, lowCutoff, offset };
  });

  const cheapestDates = months
    .flatMap((m) => m.all.filter((d) => !d.past && d.price !== null))
    .sort((a, b) => (a.price as number) - (b.price as number) || a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const updated = formatDate(calendar.updatedAt);

  return (
    <div className={styles.wrap}>
      {cheapestDates.length > 0 && (
        <div className={styles.best}>
          <h3>Cheapest dates found</h3>
          <ul>
            {cheapestDates.map((d) => (
              <li key={d.iso}>
                <AffiliateLink href={link(d.date)} subId={subId} routeSlug={route.slug} className={styles.chip}>
                  <span>{formatLongDate(d.date)?.replace(/, \d{4}$/, "")}</span>
                  <strong>{formatPrice(d.price)}</strong>
                </AffiliateLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.months}>
        {months.map(({ month, all, min, lowCutoff, offset }) => (
          <section key={month} className={styles.month} aria-label={monthLabel(month)}>
            <header>
              <h3>{monthLabel(month)}</h3>
              <span>{min !== null ? `From ${formatPrice(min)}` : "No cached fares yet"}</span>
            </header>
            <div className={styles.grid}>
              {WEEKDAYS.map((w) => (
                <span key={w} className={styles.weekday} aria-hidden="true">
                  {w}
                </span>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <span key={`pad-${i}`} aria-hidden="true" />
              ))}
              {all.map((d) => {
                const day = d.date.getUTCDate();
                if (d.past) {
                  return (
                    <span key={d.iso} className={`${styles.cell} ${styles.past}`} aria-hidden="true">
                      {day}
                    </span>
                  );
                }
                const price = d.price !== null ? formatPrice(d.price) : null;
                const tone =
                  d.price === null
                    ? styles.empty
                    : d.price === min
                      ? styles.cheapest
                      : lowCutoff !== null && d.price <= lowCutoff
                        ? styles.low
                        : "";
                return (
                  <AffiliateLink
                    key={d.iso}
                    href={link(d.date)}
                    subId={subId}
                    routeSlug={route.slug}
                    className={`${styles.cell} ${tone}`}
                    ariaLabel={`${formatLongDate(d.date)}: ${price ? `one-way from ${price}` : "search fares"}`}
                  >
                    <span className={styles.day}>{day}</span>
                    {price && <span className={styles.price}>{price}</span>}
                  </AffiliateLink>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className={styles.footer}>
        <ul className={styles.legend} aria-label="Legend">
          <li>
            <span className={`${styles.swatch} ${styles.cheapest}`} aria-hidden="true" /> Cheapest in month
          </li>
          <li>
            <span className={`${styles.swatch} ${styles.low}`} aria-hidden="true" /> Lower fares
          </li>
        </ul>
        <p>
          One-way prices per person from recent searches{updated ? `, updated ${updated}` : ""}. Pick any day to see
          live fares.
        </p>
        <AffiliateDisclosure />
      </div>
    </div>
  );
}
