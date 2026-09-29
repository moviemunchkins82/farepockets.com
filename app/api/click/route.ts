import { NextResponse, type NextRequest } from "next/server";
import { insertClickEvent } from "@/lib/db/queries/clicks";
import { isValidSlug } from "@/lib/slug";

const marker = process.env.TRAVELPAYOUTS_MARKER ?? "unset";

function str(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, max) : null;
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

// Public, unauthenticated beacon endpoint — treat every field as untrusted.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const pagePath = str(body.pagePath, 500);
  const subId = str(body.subId, 100);
  const targetUrl = str(body.targetUrl, 2000);

  if (!pagePath?.startsWith("/") || !subId || !targetUrl || !isHttpUrl(targetUrl)) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  const routeSlug = isValidSlug(body.routeSlug) ? body.routeSlug : null;

  await insertClickEvent({
    routeSlug,
    pagePath,
    marker,
    subId,
    targetUrl,
    sessionId: str(body.sessionId, 64),
    referrer: str(body.referrer, 2000),
    userAgent: str(request.headers.get("user-agent"), 500),
    utmSource: str(body.utmSource, 200),
    utmMedium: str(body.utmMedium, 200),
    utmCampaign: str(body.utmCampaign, 200),
  });

  return NextResponse.json({ ok: true });
}
