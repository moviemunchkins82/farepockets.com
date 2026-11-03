import { IMAGE_WIDTHS } from "@/lib/imageWidths";

// next/image loader: maps a statically imported city photo
// (/_next/static/media/<name>.<hash>.jpg) to its pre-made WebP variant
// (public/img/cities/<name>-<width>.webp, from scripts/build-images.ts),
// picking the smallest variant at least as wide as requested.
// Anything else is returned unchanged.
const MEDIA = /\/_next\/static\/media\/([^/.]+)\.[^/]*\.(?:jpe?g|png)$/i;

export default function cityImageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const match = MEDIA.exec(src);
  if (!match) return src;
  const variant = IMAGE_WIDTHS.find((w) => w >= width) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  return `/img/cities/${match[1]}-${variant}.webp`;
}
