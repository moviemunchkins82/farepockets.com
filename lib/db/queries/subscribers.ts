import { randomBytes } from "node:crypto";
import sql from "@/lib/db/client";

// Adds (or re-adds) a subscriber. Signing up again refreshes the consent record
// and resubscribes someone who had unsubscribed; the token stays the same.
export async function upsertSubscriber(params: {
  email: string;
  homeAirport: string | null;
  consentText: string;
  sourcePath: string | null;
  ipHash: string | null;
}): Promise<void> {
  const { email, homeAirport, consentText, sourcePath, ipHash } = params;
  const token = randomBytes(24).toString("base64url");
  await sql`
    INSERT INTO subscribers (email, home_airport, consent_text, source_path, ip_hash, unsubscribe_token)
    VALUES (${email}, ${homeAirport}, ${consentText}, ${sourcePath}, ${ipHash}, ${token})
    ON CONFLICT (email) DO UPDATE SET
      home_airport = COALESCE(EXCLUDED.home_airport, subscribers.home_airport),
      status = 'subscribed',
      consent_text = EXCLUDED.consent_text,
      consent_at = now(),
      source_path = EXCLUDED.source_path,
      ip_hash = EXCLUDED.ip_hash,
      unsubscribed_at = NULL,
      updated_at = now()
  `;
}

// How many sign-ups came from this (hashed) IP recently, for rate limiting.
export async function recentSignupsFromIp(ipHash: string, minutes: number): Promise<number> {
  const [row] = await sql<{ n: number }[]>`
    SELECT count(*)::int AS n FROM subscribers
    WHERE ip_hash = ${ipHash} AND updated_at > now() - make_interval(mins => ${minutes})
  `;
  return row?.n ?? 0;
}

// Returns false if the token doesn't match anyone.
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const rows = await sql`
    UPDATE subscribers
    SET status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
    WHERE unsubscribe_token = ${token}
    RETURNING id
  `;
  return rows.length > 0;
}
