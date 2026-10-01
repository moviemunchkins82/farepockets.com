import Link from "next/link";
import { AirplaneTilt } from "@phosphor-icons/react/ssr";
import styles from "./Logo.module.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export default function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`${styles.logo} ${inverse ? styles.inverse : ""}`} aria-label={`${SITE_NAME} home`}>
      <span className={styles.mark} aria-hidden="true">
        <AirplaneTilt size={18} weight="fill" />
      </span>
      <span className={styles.word}>{SITE_NAME}</span>
    </Link>
  );
}
