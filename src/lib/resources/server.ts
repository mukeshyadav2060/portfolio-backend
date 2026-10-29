import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { HttpError, notFound } from "@/lib/http";
import type { CacheTag } from "@/lib/revalidate";
import type { ResourceName } from "./fields";

const str = (max = 300) => z.string().trim().max(max);
const optStr = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");
const list = z.array(z.string().trim().min(1).max(200)).max(50).default([]);
const metrics = z.array(z.object({ label: str(80).min(1), value: str(40).min(1) })).max(12).default([]);
const color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #c6ff3d")
  .nullish()
  .transform((v) => v || null);
const month = z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM");
const order = z.coerce.number().int().min(-9999).max(9999).default(0);
/** Per-page search and social overrides; empty values fall back to the page's own copy. */
const seo = {
  seoTitle: optStr(70),
  seoDescription: optStr(200),
  seoKeywords: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  ogImage: optStr(1000),
};

export const validators = {
  projects: z.object({
    title: str(120).min(1),
    slug,
    summary: str(400).min(1),
    content: z.string().max(100_000).default(""),
    role: str(120).default(""),
    client: optStr(120),
    year: str(20).default(""),
    category: str(60).default("Web app"),
    status: z.enum(["production", "open-source", "in-progress", "archived", "concept"]).default("production"),
    stack: list,
    metrics,
    coverImage: optStr(1000),
    gallery: z.array(z.string().trim().min(1).max(1000)).max(20).default([]),
    liveUrl: optStr(1000),
    repoUrl: optStr(1000),
    accent: color,
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    sortOrder: order,
    ...seo,
  }),
  experience: z.object({
    company: str(120).min(1),
    role: str(120).min(1),
    location: str(120).default(""),
    employmentType: str(40).default("Full-time"),
    startDate: month,
    endDate: month.nullish().or(z.literal("")).transform((v) => v || null),
    summary: str(1000).default(""),
    highlights: list,
    stack: list,
    url: optStr(1000),
    sortOrder: order,
  }),
  services: z.object({
    title: str(120).min(1),
    summary: str(600).min(1),
    points: list,
    sortOrder: order,
  }),
  skills: z.object({
    name: str(60).min(1),
    category: str(60).min(1),
    level: z.coerce.number().int().min(0).max(100).default(80),
    sortOrder: order,
  }),
  posts: z.object({
    title: str(160).min(1),
    slug,
    excerpt: str(600).default(""),
    content: z.string().max(200_000).default(""),
    coverImage: optStr(1000),
    tags: list,
    published: z.boolean().default(false),
    publishedAt: z
      .string()
      .nullish()
      .transform((v) => (v ? new Date(v).toISOString() : null)),
    ...seo,
  }),
} satisfies Record<ResourceName, z.ZodObject>;

export const profileValidator = z.object({
  name: str(120).min(1),
  handle: str(60).min(1),
  role: str(120).min(1),
  headline: str(120).min(1),
  heroWords: list,
  intro: str(600).min(1),
  about: z.string().max(20_000).default(""),
  location: str(120).default(""),
  timezone: str(60).default("UTC"),
  email: z.email(),
  phone: optStr(40),
  availability: str(200).default(""),
  availableForWork: z.boolean().default(true),
  resumeUrl: optStr(1000),
  avatarUrl: optStr(1000),
  githubUsername: optStr(60),
  socials: z.array(z.object({ label: str(40).min(1), url: z.string().trim().min(1).max(500) })).max(12).default([]),
  stats: metrics,
  education: z
    .array(
      z.object({
        degree: str(160).min(1),
        school: str(160).min(1),
        location: optStr(120).transform((v) => v ?? undefined),
        year: str(20).min(1),
      }),
    )
    .max(10)
    .default([]),
  certifications: z
    .array(
      z.object({
        name: str(160).min(1),
        issuer: optStr(80).transform((v) => v ?? undefined),
        date: str(40).min(1),
        url: optStr(1000).transform((v) => v ?? undefined),
      }),
    )
    .max(20)
    .default([]),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#c6ff3d"),
  seoTitle: optStr(120),
  seoDescription: optStr(300),
  seoKeywords: seo.seoKeywords,
  alternateNames: z.array(z.string().trim().min(1).max(120)).max(10).default([]),
  ogImage: optStr(1000),
  twitterHandle: optStr(40).transform((v) => v?.replace(/^@/, "") || null),
  googleVerification: optStr(200),
  bingVerification: optStr(200),
});

const tables = {
  projects: schema.projects,
  experience: schema.experience,
  services: schema.services,
  skills: schema.skills,
  posts: schema.posts,
} as const;

type Row = Record<string, unknown> & { id: number };

const tagsFor: Record<ResourceName, (row: Row) => CacheTag[]> = {
  projects: (r) => ["projects", `project:${r.slug as string}`],
  experience: () => ["experience"],
  services: () => ["services"],
  skills: () => ["skills"],
  posts: (r) => ["posts", `post:${r.slug as string}`],
};

export function cacheTagsFor(name: ResourceName, ...rows: (Row | undefined)[]) {
  return [...new Set(rows.filter(Boolean).flatMap((r) => tagsFor[name](r!)))];
}

function mapDbError(error: unknown): never {
  const message = String((error as Error)?.message ?? error);
  if (message.includes("UNIQUE constraint failed")) {
    throw new HttpError(409, "That slug is already in use", { slug: ["Already in use"] });
  }
  throw error;
}

export async function listResource(name: ResourceName): Promise<Row[]> {
  const table = tables[name];
  if (name === "posts") return (await db.select().from(schema.posts).orderBy(desc(schema.posts.createdAt))) as Row[];
  return (await db
    .select()
    .from(table)
    .orderBy(asc((table as typeof schema.projects).sortOrder), asc(table.id))) as Row[];
}

export async function getResource(name: ResourceName, id: number) {
  const table = tables[name];
  const [row] = await db.select().from(table).where(eq(table.id, id)).limit(1);
  if (!row) throw notFound(name);
  return row as Row;
}

export async function createResource(name: ResourceName, input: unknown) {
  const data = validators[name].parse(input);
  try {
    const [row] = await db.insert(tables[name]).values(data as never).returning();
    return row as Row;
  } catch (error) {
    mapDbError(error);
  }
}

export async function updateResource(name: ResourceName, id: number, input: unknown) {
  const previous = await getResource(name, id);
  // Zod applies .default() even to omitted keys of a partial schema, so keep only the
  // keys the caller actually sent; otherwise a one-field update would reset the rest.
  const parsed = validators[name].partial().parse(input) as Record<string, unknown>;
  const sent = new Set(Object.keys((input ?? {}) as object));
  const data = Object.fromEntries(Object.entries(parsed).filter(([k]) => sent.has(k)));
  try {
    const table = tables[name];
    const [row] = await db
      .update(table)
      .set({ ...data, updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))` } as never)
      .where(eq(table.id, id))
      .returning();
    return { previous, row: row as Row };
  } catch (error) {
    mapDbError(error);
  }
}

export async function deleteResource(name: ResourceName, id: number) {
  const row = await getResource(name, id);
  await db.delete(tables[name]).where(eq(tables[name].id, id));
  return row;
}
