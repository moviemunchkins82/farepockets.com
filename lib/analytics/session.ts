"use client";

const STORAGE_KEY = "fp_session_id";

// Anonymous, client-generated id — no PII. Identifies the visit in Mixpanel
// (components/analytics/AnalyticsInit.tsx), once analytics are set up.
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
