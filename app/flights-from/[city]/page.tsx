import type { Metadata } from "next";
import CityHubPage, { hubMetadata, hubStaticParams } from "@/components/hubs/CityHubPage";

export const revalidate = 21600;

export function generateStaticParams() {
  return hubStaticParams("from");
}

export async function generateMetadata({ params }: PageProps<"/flights-from/[city]">): Promise<Metadata> {
  return hubMetadata("from", (await params).city);
}

export default async function Page({ params }: PageProps<"/flights-from/[city]">) {
  return <CityHubPage direction="from" slug={(await params).city} />;
}
