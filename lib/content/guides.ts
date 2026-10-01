import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { DEFAULT_AUTHOR } from "@/lib/content/authors";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");
const WORDS_PER_MINUTE = 225;

export interface GuideFrontmatter {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  // Set when a guide is meaningfully revised; shown as "Updated" and used as dateModified.
  updatedAt: string | null;
  // Name from lib/content/authors.ts; defaults to the site team.
  author: string;
  // Short label shown above the title, e.g. "Fare data".
  category: string | null;
  // Topic chips shown at the end of the guide.
  tags: string[];
  // City name from lib/cityImages.ts used as the guide's photo.
  image: string | null;
}

// Everything a guide card needs, without the body (safe to pass to client components).
export interface GuideSummary extends GuideFrontmatter {
  readingMinutes: number;
}

export interface Guide extends GuideSummary {
  content: string;
}

function readingMinutes(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
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
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
    author: typeof data.author === "string" && data.author.trim() ? data.author.trim() : DEFAULT_AUTHOR,
    category: typeof data.category === "string" ? data.category : null,
    tags: Array.isArray(data.tags) ? data.tags.filter((t): t is string => typeof t === "string") : [],
    image: typeof data.image === "string" ? data.image : null,
    readingMinutes: readingMinutes(content),
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

export function toSummary(guide: Guide): GuideSummary {
  const summary: GuideSummary & { content?: string } = { ...guide };
  delete summary.content;
  return summary;
}
