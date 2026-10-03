// Shared by the sign-up form (shown next to the button) and the server action
// (stored with each sign-up), so what people see and what we record can't drift.
// Change the wording only together with CONSENT_VERSION.
export const CONSENT_VERSION = "2026-10-03";
export const CONSENT_TEXT =
  "Sign up to get FarePockets deal-alert emails. Alerts are coming soon. You can unsubscribe at any time, and we never share your email.";

export interface SignupState {
  status: "idle" | "success" | "error";
  message: string;
}

export const INITIAL_SIGNUP_STATE: SignupState = { status: "idle", message: "" };

// Departure cities offered in the form, grouped for a <select>.
export interface AirportGroup {
  label: string;
  cities: string[];
}
