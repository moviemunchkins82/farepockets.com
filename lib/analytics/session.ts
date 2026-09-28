"use client";

const STORAGE_KEY = "fp_session_id";

// Anonymous, client-generated id — no PII. Used as the correlation key across
// click_events, GA4, and Mixpanel so the same visit can be matched across all three.
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
