"use client";

import { useEffect } from "react";
import { getSessionId } from "@/lib/analytics/session";
import { identifySession } from "@/lib/analytics/mixpanel";

// Fires once per page load client-side: establishes the anonymous session id
// and identifies it to Mixpanel (which also fires its own pageview via
// track_pageview: true on init — see lib/analytics/mixpanel.ts).
export default function AnalyticsInit() {
  useEffect(() => {
    const sessionId = getSessionId();
    if (sessionId) identifySession(sessionId);
  }, []);

  return null;
}
