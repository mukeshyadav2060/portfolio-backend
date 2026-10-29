import "server-only";
import { and, asc, desc, eq, isNotNull, lte } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Post, Project } from "@/db/schema";
import { notFound } from "@/lib/http";

const readingMinutes = (md: string) => Math.max(1, Math.round(md.split(/\s+/).filter(Boolean).length / 220));

/** Shapes returned by the public API. Content stays Markdown; the frontend renders it. */
export const toProjectCard = (p: Project) => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary,
  role: p.role,
  client: p.client,
  year: p.year,
  category: p.category,
  status: p.status,
  stack: p.stack,
  metrics: p.metrics,
  coverImage: p.coverImage,
  liveUrl: p.liveUrl,
  repoUrl: p.repoUrl,
  accent: p.accent,
  featured: p.featured,
  updatedAt: p.updatedAt,
});

const seoOf = (p: Project | Post) => ({
  seoTitle: p.seoTitle,
  seoDescription: p.seoDescription,
  seoKeywords: p.seoKeywords,
  ogImage: p.ogImage,
});

const toPostCard = (p: Post) => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  coverImage: p.coverImage,
  tags: p.tags,
  publishedAt: p.publishedAt,
  updatedAt: p.updatedAt,
  readingMinutes: readingMinutes(p.content),
});

export async function getProfile() {
  const [row] = await db.select().from(schema.profile).where(eq(schema.profile.id, 1)).limit(1);
  if (!row) throw notFound("Profile");
  const { id: _id, createdAt: _c, ...rest } = row;
  return rest;
}

export async function listProjects(opts: { featured?: boolean } = {}) {
  const where = opts.featured
    ? and(eq(schema.projects.published, true), eq(schema.projects.featured, true))
    : eq(schema.projects.published, true);
  const rows = await db
    .select()
    .from(schema.projects)
    .where(where)
    .orderBy(asc(schema.projects.sortOrder), desc(schema.projects.year));
  return rows.map(toProjectCard);
}

export async function getProject(slug: string) {
  const rows = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.published, true))
    .orderBy(asc(schema.projects.sortOrder), desc(schema.projects.year));
  const index = rows.findIndex((p) => p.slug === slug);
  if (index === -1) throw notFound("Project");
  const p = rows[index];
  const neighbour = (i: number) => {
    const n = rows[(i + rows.length) % rows.length];
    return n && n.slug !== slug ? { slug: n.slug, title: n.title } : null;
  };
  return {
    ...toProjectCard(p),
    content: p.content,
    gallery: p.gallery,
    ...seoOf(p),
    previous: neighbour(index - 1),
    next: neighbour(index + 1),
  };
}

export const listExperience = () =>
  db.select().from(schema.experience).orderBy(asc(schema.experience.sortOrder), desc(schema.experience.startDate));

export const listServices = () => db.select().from(schema.services).orderBy(asc(schema.services.sortOrder));

export async function listSkills() {
  // sortOrder restarts at 0 per category, so ties fall back to insertion order, which keeps
  // categories in the order they were created.
  const rows = await db.select().from(schema.skills).orderBy(asc(schema.skills.sortOrder), asc(schema.skills.id));
  const groups = new Map<string, { name: string; level: number }[]>();
  for (const s of rows) {
    if (!groups.has(s.category)) groups.set(s.category, []);
    groups.get(s.category)!.push({ name: s.name, level: s.level });
  }
  return [...groups].map(([category, items]) => ({ category, items }));
}

const livePosts = () =>
  and(
    eq(schema.posts.published, true),
    isNotNull(schema.posts.publishedAt),
    lte(schema.posts.publishedAt, new Date().toISOString()),
  );

export async function listPosts(limit?: number) {
  const q = db.select().from(schema.posts).where(livePosts()).orderBy(desc(schema.posts.publishedAt));
  const rows = limit ? await q.limit(limit) : await q;
  return rows.map(toPostCard);
}

export async function getPost(slug: string) {
  const [p] = await db
    .select()
    .from(schema.posts)
    .where(and(livePosts(), eq(schema.posts.slug, slug)))
    .limit(1);
  if (!p) throw notFound("Post");
  return { ...toPostCard(p), content: p.content, ...seoOf(p) };
}

/** Everything the home page needs in one round trip. */
export async function getSite() {
  const [profile, services, projects, experience, skills, posts] = await Promise.all([
    getProfile(),
    listServices(),
    listProjects({ featured: true }),
    listExperience(),
    listSkills(),
    listPosts(3),
  ]);
  return { profile, services, projects, experience, skills, posts };
}
