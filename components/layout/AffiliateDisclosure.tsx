import Link from "next/link";

// Placed adjacent to every monetized link/widget (route pages, /search, guides
// that link out) — not footer-only. FTC affiliate-disclosure requirement.
export default function AffiliateDisclosure() {
  return (
    <p role="note">
      We may earn a commission when you book through links on this page, at no extra cost to you.{" "}
      <Link href="/disclosure">Learn more</Link>.
    </p>
  );
}
