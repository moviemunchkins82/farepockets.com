// We are never the seller of record (affiliate redirect model), so no
// Offer / Product / FlightReservation schema is built anywhere in this app —
// only BreadcrumbList, FAQPage and Article, which describe navigation/content, not a sale.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://farepockets.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export function articleSchema(article: {
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  updatedAt: string | null;
  author: { name: string; type: "Organization" | "Person" };
}) {
  const url = new URL(article.url, SITE_URL).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: url,
    url,
    ...(article.imageUrl ? { image: [new URL(article.imageUrl, SITE_URL).toString()] } : {}),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      "@type": article.author.type,
      name: article.author.name,
      ...(article.author.type === "Organization" ? { url: SITE_URL } : {}),
    },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.url, SITE_URL).toString(),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
