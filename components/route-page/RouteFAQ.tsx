import JsonLd from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/seo/schema";

export default function RouteFAQ({ items }: { items: { question: string; answer: string }[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Frequently asked questions">
      <JsonLd data={faqSchema(items)} />
      <h2>Frequently asked questions</h2>
      <dl>
        {items.map((item) => (
          <div key={item.question}>
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
