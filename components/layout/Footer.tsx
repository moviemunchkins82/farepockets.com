import Link from "next/link";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export default function Footer() {
  return (
    <footer>
      <p>
        &copy; {new Date().getFullYear()} {SITE_NAME}
      </p>
      <nav>
        <Link href="/disclosure">How we make money</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  );
}
