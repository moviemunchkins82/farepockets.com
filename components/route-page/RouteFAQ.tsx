import { CaretDown } from "@phosphor-icons/react/ssr";
import JsonLd from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo/schema";
import styles from "./RouteFAQ.module.css";

export default function RouteFAQ({ items }: { items: { question: string; answer: string }[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading">
      <JsonLd data={faqSchema(items)} />
      <h2 id="faq-heading" className={styles.heading}>
        Frequently asked questions
      </h2>
      <div className={styles.list}>
        {items.map((item, i) => (
          <details key={item.question} className={styles.item} open={i === 0}>
            <summary>
              {item.question}
              <CaretDown size={18} weight="bold" aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
