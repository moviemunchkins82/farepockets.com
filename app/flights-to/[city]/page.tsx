import type { Metadata } from "next";
import CityHubPage, { hubMetadata, hubStaticParams } from "@/components/hubs/CityHubPage";

export const revalidate = 21600;

export function generateStaticParams() {
  return hubStaticParams("to");
}

export async function generateMetadata({ params }: PageProps<"/flights-to/[city]">): Promise<Metadata> {
  return hubMetadata("to", (await params).city);
}

export default async function Page({ params }: PageProps<"/flights-to/[city]">) {
  return <CityHubPage direction="to" slug={(await params).city} />;
}
