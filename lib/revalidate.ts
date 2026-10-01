import { revalidatePath } from "next/cache";

// Prices appear site-wide (the header menu and footer are in the root layout,
// guides show fares in their sidebar), so a refresh revalidates every page.
// Pages regenerate on their next visit, not all at once.
export function revalidateRoutePages(slugs: string[]): void {
  for (const slug of slugs) revalidatePath(`/flights/${slug}`);
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}
