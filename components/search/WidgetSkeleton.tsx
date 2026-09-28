// Reserves the exact height the loaded widget iframe will occupy — required
// to keep CLS near 0 (see plan's Core Web Vitals verification step).
// Adjust WIDGET_HEIGHT once the real Travelpayouts widget's rendered height is known.
const WIDGET_HEIGHT = 400;

export default function WidgetSkeleton() {
  return (
    <div style={{ height: WIDGET_HEIGHT, width: "100%" }} aria-hidden="true" data-testid="widget-skeleton" />
  );
}
