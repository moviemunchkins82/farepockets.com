"use client";

import { useEffect, useState } from "react";
import { Check, EnvelopeSimple, FacebookLogo, LinkSimple, LinkedinLogo, XLogo } from "@phosphor-icons/react";
import styles from "./ShareButtons.module.css";

// Plain share links (no third-party scripts or tracking) plus copy-to-clipboard.
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookLogo },
    { label: "Share on X", href: `https://x.com/intent/post?url=${u}&text=${t}`, Icon: XLogo },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: LinkedinLogo },
    { label: "Share by email", href: `mailto:?subject=${t}&body=${u}`, Icon: EnvelopeSimple },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (permissions, insecure context); leave the button as is.
    }
  }

  return (
    <div className={styles.share} role="group" aria-label="Share this guide">
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          className={styles.button}
          aria-label={label}
          title={label}
          {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        >
          <Icon size={18} aria-hidden="true" />
        </a>
      ))}
      <button
        type="button"
        className={styles.button}
        onClick={copy}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Link copied" : "Copy link"}
      >
        {copied ? <Check size={18} weight="bold" aria-hidden="true" /> : <LinkSimple size={18} aria-hidden="true" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
