import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

export interface GuideFrontmatter {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  // Short label shown above the title, e.g. "Fare data".
  category: string | null;
  // City name from lib/cityImages.ts used as the guide's thumbnail.
  image: string | null;
}

export interface Guide extends GuideFrontmatter {
  content: string;
}

export function listGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getGuide(slug: string): Guide | null {
  const filePath = path.join(GUIDES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title,
    description: data.description,
    publishedAt: data.publishedAt,
    category: typeof data.category === "string" ? data.category : null,
    image: typeof data.image === "string" ? data.image : null,
    content,
  };
}

// Newest first.
export function listGuides(): Guide[] {
  return listGuideSlugs()
    .map((slug) => getGuide(slug))
    .filter((g): g is Guide => g !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
