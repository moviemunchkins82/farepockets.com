import sql from "@/lib/db/client";

export async function insertClickEvent(params: {
  routeSlug: string | null;
  pagePath: string;
  marker: string;
  subId: string;
  targetUrl: string;
  sessionId: string | null;
  referrer: string | null;
  userAgent: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}): Promise<void> {
  const {
    routeSlug, pagePath, marker, subId, targetUrl,
    sessionId, referrer, userAgent, utmSource, utmMedium, utmCampaign,
  } = params;

  await sql`
    INSERT INTO click_events (
      route_slug, page_path, marker, sub_id, target_url,
      session_id, referrer, user_agent, utm_source, utm_medium, utm_campaign
    ) VALUES (
      ${routeSlug}, ${pagePath}, ${marker}, ${subId}, ${targetUrl},
      ${sessionId}, ${referrer}, ${userAgent}, ${utmSource}, ${utmMedium}, ${utmCampaign}
    )
  `;
}

// Click history is kept for 13 months (a full year-on-year comparison), then
// deleted so the free-tier database never fills up. Returns how many rows went.
export const CLICK_RETENTION_MONTHS = 13;

export async function deleteOldClickEvents(months = CLICK_RETENTION_MONTHS): Promise<number> {
  const result = await sql`
    DELETE FROM click_events WHERE occurred_at < now() - make_interval(months => ${months})
  `;
  return result.count;
}
