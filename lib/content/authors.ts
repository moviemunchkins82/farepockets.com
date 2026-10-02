const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "FarePockets";

export interface Author {
  name: string;
  // Schema.org type for the Article's author.
  type: "Organization" | "Person";
  bio: string | null;
}

export const DEFAULT_AUTHOR = `${SITE_NAME} Team`;

// Guides name their author in frontmatter (`author:`); anything not listed here
// is shown by name only. Add a real person here (with a short, factual bio) to
// give their guides an author box.
const AUTHORS: Record<string, Author> = {
  [DEFAULT_AUTHOR]: {
    name: DEFAULT_AUTHOR,
    type: "Organization",
    bio: `${SITE_NAME} tracks the cheapest one-way fares on popular routes and checks them twice a day. Our guides are based on that fare data and on how airline pricing works.`,
  },
};

export function getAuthor(name: string | null | undefined): Author {
  const key = name?.trim() || DEFAULT_AUTHOR;
  return AUTHORS[key] ?? { name: key, type: "Person", bio: null };
}
