import Link from "next/link";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export default function Header() {
  return (
    <header>
      <nav>
        <Link href="/">{SITE_NAME}</Link>
        <Link href="/search">Search flights</Link>
        <Link href="/guides">Guides</Link>
      </nav>
    </header>
  );
}
