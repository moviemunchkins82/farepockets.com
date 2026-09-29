import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/auth/cronSecret";
import { revalidateRoutePages } from "@/lib/revalidate";
import { isValidSlug } from "@/lib/slug";

// Called by scripts/refresh-prices.ts after a refresh run, so cached pages show
// fresh prices immediately instead of waiting out the ISR window.
export async function POST(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let slugs: unknown;
  try {
    ({ slugs } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!Array.isArray(slugs) || slugs.length > 1000 || !slugs.every(isValidSlug)) {
    return NextResponse.json({ error: "slugs must be an array of route slugs" }, { status: 400 });
  }

  revalidateRoutePages(slugs);
  return NextResponse.json({ revalidated: true, count: slugs.length });
}
