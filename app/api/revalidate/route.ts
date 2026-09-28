import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

// Called at the end of scripts/refresh-prices.ts for each slug that actually
// changed, so ISR reflects fresh prices immediately instead of waiting out
// the 6h revalidate window.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await request.json();
  if (!slug) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 });
  }

  revalidatePath(`/flights/${slug}`);
  return NextResponse.json({ revalidated: true, slug });
}
