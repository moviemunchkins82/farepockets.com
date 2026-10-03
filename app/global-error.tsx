"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

// Replaces the whole page (root layout included) when even the layout fails, so
// it brings its own document and inline styles; global CSS doesn't load here.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#ffffff",
          color: "#111827",
        }}
      >
        <title>Something went wrong | FarePockets</title>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>Something went wrong</h1>
          <p style={{ color: "#4e5562", lineHeight: 1.6, margin: "0 0 24px" }}>
            FarePockets didn&apos;t load properly. Please try again in a moment.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                padding: "12px 20px",
                border: 0,
                borderRadius: 8,
                background: "#cc4747",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* A plain link on purpose: the client router may be what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: "12px 20px",
                borderRadius: 8,
                border: "1px solid #e0e5eb",
                color: "#111827",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              Go to the home page
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
