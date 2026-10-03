import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Default share image for pages that don't set their own (guides use their photo).
export const alt = "FarePockets: cheap flights, wherever you're going";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inter, the site font (@fontsource/inter, OFL). The share image renderer reads
// .woff but not .woff2.
const fontDir = join(process.cwd(), "node_modules/@fontsource/inter/files");

export default async function OpengraphImage() {
  const [regular, bold] = await Promise.all([
    readFile(join(fontDir, "inter-latin-400-normal.woff")),
    readFile(join(fontDir, "inter-latin-700-normal.woff")),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #2f6369 0%, #3d7a81 100%)",
          color: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 18,
              background: "#cc4747",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Phosphor "AirplaneTilt" (fill), the site logo mark */}
            <svg width="52" height="52" viewBox="0 0 256 256" fill="#ffffff">
              <path d="M215.52,197.26a8,8,0,0,1-1.86,8.39l-24,24A8,8,0,0,1,184,232a7.09,7.09,0,0,1-.79,0,8,8,0,0,1-5.87-3.52l-44.07-66.12L112,183.59V208a8,8,0,0,1-2.34,5.65s-14,14.06-15.88,15.88A7.91,7.91,0,0,1,91,231.41a8,8,0,0,1-10.41-4.35l-.06-.15-14.7-36.76L29,175.42a8,8,0,0,1-2.69-13.08l16-16A8,8,0,0,1,48,144H72.4l21.27-21.27L27.56,78.65a8,8,0,0,1-1.22-12.32l24-24a8,8,0,0,1,8.39-1.86l85.94,31.25L176.2,40.19a28,28,0,0,1,39.6,39.6l-31.53,31.53Z" />
            </svg>
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>FarePockets</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
            Cheap flights, wherever you&apos;re going
          </div>
          <div style={{ fontSize: 32, opacity: 0.88, maxWidth: 980 }}>
            Turkey, the Caucasus and Central Asia from the UK, plus popular US and UK routes
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
