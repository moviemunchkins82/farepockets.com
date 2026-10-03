import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import UnsubscribeForm from "./UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const raw = (await searchParams).token;
  const token = typeof raw === "string" ? raw : "";

  return (
    <main>
      <PageHeader title="Unsubscribe from deal alerts" />
      <div className="container page">
        <div className="prose">
          {token ? (
            <UnsubscribeForm token={token} />
          ) : (
            <p>To unsubscribe, use the link at the bottom of any of our deal-alert emails.</p>
          )}
        </div>
      </div>
    </main>
  );
}
