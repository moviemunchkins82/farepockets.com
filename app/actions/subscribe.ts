"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { listActiveRoutes } from "@/lib/db/queries/routes";
import { recentSignupsFromIp, upsertSubscriber } from "@/lib/db/queries/subscribers";
import { CONSENT_TEXT, CONSENT_VERSION, type SignupState } from "@/lib/signup";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_SIGNUPS_PER_IP_PER_HOUR = 5;

const success: SignupState = {
  status: "success",
  message: "You're on the list. We'll email you when deal alerts launch.",
};

function hashIp(ip: string | null): string | null {
  const salt = process.env.IP_HASH_SALT ?? process.env.CRON_SECRET;
  if (!ip || !salt) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

// Public form endpoint: treat every field as untrusted.
export async function subscribe(_prev: SignupState, formData: FormData): Promise<SignupState> {
  // Honeypot: people never see this field, bots fill it. Pretend it worked.
  if (String(formData.get("website") ?? "") !== "") return success;

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const pathValue = String(formData.get("path") ?? "");
  const sourcePath = pathValue.startsWith("/") ? pathValue.slice(0, 200) : null;

  try {
    // Only accept departure cities we actually track; anything else is stored as unknown.
    const home = String(formData.get("home") ?? "").trim();
    const origins = new Set((await listActiveRoutes()).map((r) => r.origin_city));
    const homeAirport = origins.has(home) ? home : null;

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
    const ipHash = hashIp(ip ?? null);
    if (ipHash && (await recentSignupsFromIp(ipHash, 60)) >= MAX_SIGNUPS_PER_IP_PER_HOUR) {
      return { status: "error", message: "Too many sign-ups from your connection. Please try again later." };
    }

    await upsertSubscriber({
      email,
      homeAirport,
      consentText: `[${CONSENT_VERSION}] ${CONSENT_TEXT}`,
      sourcePath,
      ipHash,
    });
    // Same reply whether or not the email was already on the list, so the form
    // can't be used to check who has signed up.
    return success;
  } catch (error) {
    console.error("subscribe failed", error);
    return { status: "error", message: "Something went wrong. Please try again in a moment." };
  }
}
