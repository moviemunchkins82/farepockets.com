// Pre-makes each city photo in a few widths as WebP (public/img/cities/<name>-<width>.webp),
// served by lib/imageLoader.ts. This replaces on-the-fly image optimisation, which
// Cloudflare Workers can't do for free, and works the same on any host.
// Runs automatically before `dev` and `build`; skips files that are already up to date.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { IMAGE_WIDTHS } from "../lib/imageWidths";

const SOURCE_DIR = path.join(process.cwd(), "assets", "cities");
const OUT_DIR = path.join(process.cwd(), "public", "img", "cities");
const QUALITY = 72;

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const sources = fs.readdirSync(SOURCE_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));
  let written = 0;

  for (const file of sources) {
    const name = file.replace(/\.[^.]+$/, "");
    const sourcePath = path.join(SOURCE_DIR, file);
    const sourceTime = fs.statSync(sourcePath).mtimeMs;
    for (const width of IMAGE_WIDTHS) {
      const outPath = path.join(OUT_DIR, `${name}-${width}.webp`);
      if (fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs >= sourceTime) continue;
      await sharp(sourcePath).resize({ width, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(outPath);
      written++;
    }
  }
  console.log(`City images: ${sources.length} photos, ${written} variants written (${IMAGE_WIDTHS.join(", ")}px).`);
}

main().catch((err) => {
  console.error("build-images failed:", err);
  process.exitCode = 1;
});
