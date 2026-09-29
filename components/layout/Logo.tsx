import Link from "next/link";
import { AirplaneTilt } from "@phosphor-icons/react/ssr";
import styles from "./Logo.module.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export default function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label={`${SITE_NAME} home`}>
      <span className={styles.mark} aria-hidden="true">
        <AirplaneTilt size={18} weight="fill" />
      </span>
      <span className={styles.word}>{SITE_NAME}</span>
    </Link>
  );
}
