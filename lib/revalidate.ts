import { revalidatePath } from "next/cache";

// Every page that renders cached route prices.
export function revalidateRoutePages(slugs: string[]): void {
  for (const slug of slugs) revalidatePath(`/flights/${slug}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}
