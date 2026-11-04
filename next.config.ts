import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { IMAGE_WIDTHS } from "./lib/imageWidths";

// Basic hardening sent with every response (works on Vercel and on a plain
// `next start`, e.g. Hostinger). No Content-Security-Policy yet: the
// Travelpayouts widget and analytics load third-party scripts, and a strict
// policy would need testing against them first.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Other sites can't embed ours in a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // City photos are pre-made in fixed widths (scripts/build-images.ts) and served
  // as static files by lib/imageLoader.ts, so no image optimisation server is
  // needed (Cloudflare Workers can't run one for free). The sizes below match.
  images: {
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    deviceSizes: IMAGE_WIDTHS.filter((w) => w >= 640),
    imageSizes: IMAGE_WIDTHS.filter((w) => w < 640),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

// Lets `next dev` use Cloudflare bindings; no effect on builds.
initOpenNextCloudflareForDev();
