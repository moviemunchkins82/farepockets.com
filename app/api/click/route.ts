import { NextResponse, type NextRequest } from "next/server";
import { insertClickEvent } from "@/lib/db/queries/clicks";

const marker = process.env.TRAVELPAYOUTS_MARKER ?? "unset";

export async function POST(request: NextRequest) {
  let body: {
    routeSlug: string | null;
    pagePath: string;
    subId: string;
    targetUrl: string;
    sessionId: string | null;
    referrer: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!body.pagePath || !body.subId || !body.targetUrl) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }

  await insertClickEvent({
    routeSlug: body.routeSlug ?? null,
    pagePath: body.pagePath,
    marker,
    subId: body.subId,
    targetUrl: body.targetUrl,
    sessionId: body.sessionId ?? null,
    referrer: body.referrer ?? null,
    userAgent: request.headers.get("user-agent"),
    utmSource: body.utmSource ?? null,
    utmMedium: body.utmMedium ?? null,
    utmCampaign: body.utmCampaign ?? null,
  });

  return NextResponse.json({ ok: true });
}
