import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";

export default function Breadcrumbs({ items }: { items: { name: string; url: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb">
        <ol>
          {items.map((item, i) => (
            <li key={item.url}>
              {i < items.length - 1 ? <Link href={item.url}>{item.name}</Link> : <span>{item.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
