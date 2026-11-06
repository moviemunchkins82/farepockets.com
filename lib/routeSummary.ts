import { formatFullDate, formatPrice, formatStops, listNames } from "@/lib/format";
import type { RouteRow } from "@/lib/routes/types";
import type { PriceCalendarData, RouteFacts } from "@/lib/travelpayouts/types";

// A few plain sentences at the top of a route page that state its key facts
// (cheapest fare and date, how many days have fares, typical fare by month,
// direct flights, when the data was checked). Each sentence makes sense on its
// own, so a search engine or AI answer can quote it with the date attached.
// Every figure comes from the same data as the calendar and FAQ below it.

const MIN_DAYS_FOR_MEDIAN = 3;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const monthName = (month: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));

export function routeSummary(
  route: RouteRow,
  calendar: PriceCalendarData | null,
  facts: RouteFacts | null,
  now = new Date(),
): string[] {
  const from = route.origin_city;
  const to = route.destination_city;
  const money = (n: number) => formatPrice(n, route.currency);
  const sentences: string[] = [];

  const price = formatPrice(route.cheapest_price, route.cheapest_currency);
  const date = formatFullDate(route.cheapest_depart_date);
  if (price) {
    sentences.push(
      `The cheapest one-way fare we found from ${from} to ${to} is ${price}${date ? `, departing ${date}` : ""}.`,
    );
  }

  if (calendar && calendar.months.length > 0) {
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const future = <T extends { date: string }>(days: T[]) => days.filter((d) => Date.parse(`${d.date}T00:00:00Z`) >= today);

    // Days from today to the end of the last month in the calendar.
    const last = calendar.months[calendar.months.length - 1].month;
    const [y, m] = last.split("-").map(Number);
    const windowDays = Math.round((Date.UTC(y, m, 1) - today) / 86_400_000);
    const pricedDays = calendar.months.reduce((n, mo) => n + future(mo.days).length, 0);
    if (windowDays > 0 && pricedDays > 0) {
      sentences.push(`Recent searches found fares on ${pricedDays} of the next ${windowDays} days.`);
    }

    const medians = calendar.months
      .map((mo) => ({ month: mo.month, prices: future(mo.days).map((d) => d.price) }))
      .filter((mo) => mo.prices.length >= MIN_DAYS_FOR_MEDIAN)
      .map((mo) => `${money(Math.round(median(mo.prices)))} in ${monthName(mo.month)}`);
    if (medians.length > 0) {
      sentences.push(`The typical (median) one-way fare is ${listNames(medians)}.`);
    }
  }

  if (facts) {
    const n = facts.nonstop;
    const word = route.origin_country === "US" ? "nonstop" : "direct";
    // The most common number of stops on the cheapest fares, when one clearly dominates.
    const top = [...facts.stops].sort((a, b) => b.count - a.count)[0];
    const typical =
      top && facts.sampleSize > 0 && top.count / facts.sampleSize >= 0.6
        ? top.stops === 0
          ? `most of the cheapest fares were ${word}`
          : `most of the cheapest fares had ${formatStops(top.stops)}`
        : null;
    sentences.push(
      n
        ? `The cheapest ${word} fare was ${money(n.price)}${n.airline ? ` with ${n.airline}` : ""}${typical ? `, and ${typical}` : ""}.`
        : `We found no ${word} fares in recent searches${typical ? `; ${typical}` : ""}.`,
    );
  }

  const checked = formatFullDate(route.last_refreshed_at);
  if (sentences.length > 0 && checked) {
    sentences.push(`Prices were last checked on ${checked.replace(/^\w+, /, "")}, and change often.`);
  }
  return sentences;
}
