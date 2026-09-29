import { NextResponse, type NextRequest } from "next/server";
import { safeEqual } from "@/lib/auth/cronSecret";

// Pre-launch access gate. Active whenever BASIC_AUTH_USER/PASS are set.
// Blank both env vars in the single launch-flip deploy (alongside the
// noindex/robots flip) to open the site — never stagger the two.
export function proxy(request: NextRequest): NextResponse {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const separatorIndex = decoded.indexOf(":");
      if (separatorIndex !== -1) {
        const userOk = safeEqual(decoded.slice(0, separatorIndex), user);
        const passOk = safeEqual(decoded.slice(separatorIndex + 1), pass);
        if (userOk && passOk) return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="FarePockets"' },
  });
}

// Cron/revalidate endpoints are excluded: they're called by the server's own
// crontab and are protected by CRON_SECRET instead.
export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|api/cron|api/revalidate).*)",
};
