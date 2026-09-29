import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import type { Guide } from "@/lib/content/guides";
import styles from "./GuideList.module.css";

export default function GuideList({ guides }: { guides: Guide[] }) {
  return (
    <ul className={styles.list}>
      {guides.map((guide) => (
        <li key={guide.slug}>
          <Link href={`/guides/${guide.slug}`} className={styles.row}>
            <div>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
            </div>
            <ArrowRight size={20} weight="bold" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
