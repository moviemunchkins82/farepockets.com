"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import styles from "./error.module.css";

// Shown inside the normal header and footer when a page fails to render.
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.main}>
      <div className="container">
        <h1>Something went wrong</h1>
        <p>
          This page didn&apos;t load properly. Try again, or carry on searching. Your search and our deals pages are
          still working.
        </p>
        <div className={styles.actions}>
          <button type="button" className="button" onClick={() => retry()}>
            Try again
          </button>
          <Link href="/search" className="button button-secondary">
            Search flights
          </Link>
          <Link href="/flights" className="button button-secondary">
            Flight deals
          </Link>
        </div>
      </div>
    </main>
  );
}
