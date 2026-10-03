import { AirplaneTakeoff, Airplane, ArrowsSplit, Buildings } from "@phosphor-icons/react/ssr";
import { formatDate, formatDuration, formatPrice, listNames, shortAirportName } from "@/lib/format";
import { stopsSummary } from "@/lib/routeFacts";
import type { RouteFacts } from "@/lib/travelpayouts/types";
import type { RouteRow } from "@/lib/db/schema";
import styles from "./RouteFactsPanel.module.css";

// "Good to know" facts for one route, from the same searches as its prices.
export default function RouteFactsPanel({ route, facts }: { route: RouteRow; facts: RouteFacts }) {
  const nonstop = facts.nonstop;
  const stops = stopsSummary(facts);
  // Only worth listing airports when the city code covers several (e.g. LON, NYC).
  const departs = facts.originAirports.length > 1 ? facts.originAirports.slice(0, 3) : [];
  const arrives = facts.destinationAirports.length > 1 ? facts.destinationAirports.slice(0, 3) : [];

  return (
    <div>
      <ul className={styles.grid}>
        <li className={styles.fact}>
          <span className={styles.icon} aria-hidden="true">
            <AirplaneTakeoff size={22} />
          </span>
          <span className={styles.label}>Nonstop flights</span>
          {nonstop ? (
            <>
              <span className={styles.value}>From {formatPrice(nonstop.price, route.currency)}</span>
              <span className={styles.detail}>
                {[nonstop.airline, `${shortAirportName(nonstop.origin.name)} to ${shortAirportName(nonstop.destination.name)}`, formatDuration(nonstop.durationMinutes)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </>
          ) : (
            <>
              <span className={styles.value}>None found</span>
              <span className={styles.detail}>Recent searches found no nonstop fares on this route.</span>
            </>
          )}
        </li>

        {stops && (
          <li className={styles.fact}>
            <span className={styles.icon} aria-hidden="true">
              <ArrowsSplit size={22} />
            </span>
            <span className={styles.label}>Stops on the cheapest fares</span>
            <span className={styles.value}>{stops.headline}</span>
            <span className={styles.detail}>{stops.detail}</span>
          </li>
        )}

        {facts.airlines.length > 0 && (
          <li className={styles.fact}>
            <span className={styles.icon} aria-hidden="true">
              <Airplane size={22} />
            </span>
            <span className={styles.label}>Airlines on the cheapest fares</span>
            <span className={styles.value}>{listNames(facts.airlines.slice(0, 3))}</span>
            <span className={styles.detail}>
              {facts.airlines.length > 3 ? `Also ${listNames(facts.airlines.slice(3))}. ` : ""}
              Fares with stops may combine airlines.
            </span>
          </li>
        )}

        {(departs.length > 0 || arrives.length > 0) && (
          <li className={styles.fact}>
            <span className={styles.icon} aria-hidden="true">
              <Buildings size={22} />
            </span>
            <span className={styles.label}>Airports used</span>
            <span className={styles.value}>
              {listNames((departs.length > 0 ? departs : arrives).map((a) => shortAirportName(a.name)))}
            </span>
            <span className={styles.detail}>
              {departs.length > 0
                ? `Where the cheapest fares from ${route.origin_city} leave from, most common first.`
                : `Where the cheapest fares to ${route.destination_city} arrive, most common first.`}
              {departs.length > 0 && arrives.length > 0 ? ` Arriving at ${listNames(arrives.map((a) => shortAirportName(a.name)))}.` : ""}
            </span>
          </li>
        )}
      </ul>
      <p className={styles.note}>
        Based on the {facts.sampleSize} cheapest one-way fares in recent searches
        {formatDate(facts.updatedAt) ? `, checked ${formatDate(facts.updatedAt)}` : ""}.
      </p>
    </div>
  );
}
