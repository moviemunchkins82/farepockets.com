import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";
import styles from "./Breadcrumbs.module.css";

export default function Breadcrumbs({ items }: { items: { name: string; url: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb" className={styles.nav}>
        <ol>
          {items.map((item, i) => (
            <li key={item.url}>
              {i < items.length - 1 ? (
                <Link href={item.url}>{item.name}</Link>
              ) : (
                <span aria-current="page">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
