import type { Metadata } from "next";
import CityHubPage, { hubMetadata, hubStaticParams } from "@/components/hubs/CityHubPage";


// Only the pages built from our data exist; any other URL gets the prebuilt 404
// instead of a render attempt, so junk URLs cost no Worker CPU.
export const dynamicParams = false;

export function generateStaticParams() {
  return hubStaticParams("from");
}

export async function generateMetadata({ params }: PageProps<"/flights-from/[city]">): Promise<Metadata> {
  return hubMetadata("from", (await params).city);
}

export default async function Page({ params }: PageProps<"/flights-from/[city]">) {
  return <CityHubPage direction="from" slug={(await params).city} />;
}
