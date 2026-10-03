"use client";

import { useActionState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, EnvelopeSimple } from "@phosphor-icons/react";
import { subscribe } from "@/app/actions/subscribe";
import { CONSENT_TEXT, INITIAL_SIGNUP_STATE, type AirportGroup } from "@/lib/signup";
import styles from "./SignupForm.module.css";

// Deal-alert sign-up. "card" sits on light pages; "footer" on the dark footer.
export default function SignupForm({
  airportGroups,
  variant = "card",
  heading = "Get cheap flight alerts",
  intro = "Be the first to hear about price drops on routes from your airport.",
}: {
  airportGroups: AirportGroup[];
  variant?: "card" | "footer";
  heading?: string;
  intro?: string;
}) {
  const [state, formAction, pending] = useActionState(subscribe, INITIAL_SIGNUP_STATE);
  const pathname = usePathname();
  const idPrefix = `signup-${variant}`;

  return (
    <section className={`${styles.box} ${styles[variant]}`} aria-labelledby={`${idPrefix}-heading`}>
      <div className={styles.text}>
        <h2 id={`${idPrefix}-heading`} className={styles.heading}>
          <EnvelopeSimple size={22} weight="bold" aria-hidden="true" />
          {heading}
        </h2>
        <p className={styles.intro}>{intro}</p>
      </div>

      {state.status === "success" ? (
        <p className={styles.success} role="status">
          <CheckCircle size={22} weight="fill" aria-hidden="true" />
          {state.message}
        </p>
      ) : (
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="path" value={pathname ?? ""} />
          {/* Honeypot: hidden from people, filled in by bots. */}
          <div className={styles.trap} aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>

          <div className={styles.fields}>
            <label htmlFor={`${idPrefix}-email`} className="sr-only">
              Email address
            </label>
            <input
              id={`${idPrefix}-email`}
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              inputMode="email"
              placeholder="Your email address"
              className={styles.input}
            />
            {airportGroups.length > 0 && (
              <>
                <label htmlFor={`${idPrefix}-home`} className="sr-only">
                  Where do you usually fly from? (optional)
                </label>
                <select id={`${idPrefix}-home`} name="home" defaultValue="" className={styles.select}>
                  <option value="">Your airport (optional)</option>
                  {airportGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </>
            )}
            <button type="submit" className={`button ${styles.submit}`} disabled={pending}>
              {pending ? "Signing up…" : "Sign up"}
            </button>
          </div>

          <p className={styles.consent}>
            {CONSENT_TEXT} <Link href="/privacy">Privacy policy</Link>.
          </p>
          <p className={styles.error} aria-live="polite">
            {state.status === "error" ? state.message : ""}
          </p>
        </form>
      )}
    </section>
  );
}
