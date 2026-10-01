import Breadcrumbs from "@/components/route-page/Breadcrumbs";
import styles from "./PageHeader.module.css";

// Teal page band used by non-photo pages (search, guides, legal, deals).
export default function PageHeader({
  title,
  description,
  breadcrumbs,
  kicker,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { name: string; url: string }[];
  kicker?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className={styles.band}>
      <div className="container">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {kicker && <p className={styles.kicker}>{kicker}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {children}
      </div>
    </section>
  );
}
