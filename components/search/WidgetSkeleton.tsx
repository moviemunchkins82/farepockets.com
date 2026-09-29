// Overlays the widget's reserved space until the form has drawn.
export default function WidgetSkeleton({ configured = true }: { configured?: boolean }) {
  return (
    <div className="widget-skeleton" style={{ position: "absolute", inset: 0 }} data-testid="widget-skeleton">
      {!configured && process.env.NODE_ENV !== "production" && (
        <p>Search widget not configured — set TRAVELPAYOUTS_WIDGET_SRC_TEMPLATE and TRAVELPAYOUTS_MARKER.</p>
      )}
    </div>
  );
}
