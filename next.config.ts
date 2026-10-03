import type { NextConfig } from "next";

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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
