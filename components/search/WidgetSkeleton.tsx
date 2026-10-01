import styles from "./WidgetSkeleton.module.css";

// Mirrors the Travelpayouts form (same labels, field sizes and breakpoints) so
// the real form drops into place without anything moving.
const FIELDS = [
  { key: "origin", label: "Origin" },
  { key: "destination", label: "Destination" },
  { key: "depart", label: "Depart date" },
  { key: "return", label: "Return date" },
  { key: "passengers", label: "Passengers" },
] as const;

export default function WidgetSkeleton({ configured = true }: { configured?: boolean }) {
  if (!configured) {
    return (
      <div className={styles.skeleton}>
        {process.env.NODE_ENV !== "production" && (
          <p className={styles.note}>
            Search widget not configured — set TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE and TRAVELPAYOUTS_MARKER.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.skeleton}>
      <p className="sr-only" role="status">
        Loading the flight search form
      </p>
      <div className={styles.grid} aria-hidden="true">
        {FIELDS.map((field) => (
          <div key={field.key} className={`${styles.field} ${styles[field.key]}`}>
            <span className={styles.label}>{field.label}</span>
            <span className={styles.box} />
          </div>
        ))}
        <div className={`${styles.field} ${styles.search}`}>
          <span className={styles.label} />
          <span className={styles.button}>Search</span>
        </div>
      </div>
    </div>
  );
}
