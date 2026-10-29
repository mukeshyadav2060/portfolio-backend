import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export type LinkItem = { label: string; url: string };
export type Metric = { label: string; value: string };
export type Education = { degree: string; school: string; location?: string; year: string };
export type Certification = { name: string; issuer?: string; date: string; url?: string };

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
};

/** Single-row table (id = 1) holding the owner's identity and site-wide settings. */
export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  role: text("role").notNull(),
  headline: text("headline").notNull(),
  heroWords: text("hero_words", { mode: "json" }).$type<string[]>().notNull().default([]),
  intro: text("intro").notNull(),
  about: text("about").notNull().default(""),
  location: text("location").notNull().default(""),
  timezone: text("timezone").notNull().default("UTC"),
  email: text("email").notNull(),
  phone: text("phone"),
  availability: text("availability").notNull().default(""),
  availableForWork: integer("available_for_work", { mode: "boolean" }).notNull().default(true),
  resumeUrl: text("resume_url"),
  avatarUrl: text("avatar_url"),
  githubUsername: text("github_username"),
  socials: text("socials", { mode: "json" }).$type<LinkItem[]>().notNull().default([]),
  stats: text("stats", { mode: "json" }).$type<Metric[]>().notNull().default([]),
  education: text("education", { mode: "json" }).$type<Education[]>().notNull().default([]),
  certifications: text("certifications", { mode: "json" }).$type<Certification[]>().notNull().default([]),
  accent: text("accent").notNull().default("#c6ff3d"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords", { mode: "json" }).$type<string[]>().notNull().default([]),
  /** Other names people search for, e.g. "Mukesh Yadav". Feeds Person.alternateName. */
  alternateNames: text("alternate_names", { mode: "json" }).$type<string[]>().notNull().default([]),
  ogImage: text("og_image"),
  twitterHandle: text("twitter_handle"),
  googleVerification: text("google_verification"),
  bingVerification: text("bing_verification"),
  ...timestamps,
});

/** Per-page search and social overrides shared by projects and posts. */
const seo = {
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords", { mode: "json" }).$type<string[]>().notNull().default([]),
  ogImage: text("og_image"),
};

export const projects = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull().default(""),
    role: text("role").notNull().default(""),
    client: text("client"),
    year: text("year").notNull().default(""),
    category: text("category").notNull().default("Web app"),
    status: text("status", { enum: ["production", "open-source", "in-progress", "archived", "concept"] })
      .notNull()
      .default("production"),
    stack: text("stack", { mode: "json" }).$type<string[]>().notNull().default([]),
    metrics: text("metrics", { mode: "json" }).$type<Metric[]>().notNull().default([]),
    coverImage: text("cover_image"),
    gallery: text("gallery", { mode: "json" }).$type<string[]>().notNull().default([]),
    liveUrl: text("live_url"),
    repoUrl: text("repo_url"),
    accent: text("accent"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...seo,
    ...timestamps,
  },
  (t) => [uniqueIndex("projects_slug_idx").on(t.slug), index("projects_order_idx").on(t.sortOrder)],
);

export const experience = sqliteTable("experience", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  location: text("location").notNull().default(""),
  employmentType: text("employment_type").notNull().default("Full-time"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  summary: text("summary").notNull().default(""),
  highlights: text("highlights", { mode: "json" }).$type<string[]>().notNull().default([]),
  stack: text("stack", { mode: "json" }).$type<string[]>().notNull().default([]),
  url: text("url"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  points: text("points", { mode: "json" }).$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const skills = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  level: integer("level").notNull().default(80),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""),
    coverImage: text("cover_image"),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    publishedAt: text("published_at"),
    ...seo,
    ...timestamps,
  },
  (t) => [uniqueIndex("posts_slug_idx").on(t.slug)],
);

export const messages = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    budget: text("budget"),
    message: text("message").notNull(),
    read: integer("read", { mode: "boolean" }).notNull().default(false),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("messages_created_idx").on(t.createdAt)],
);

export type Profile = typeof profile.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Experience = typeof experience.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Message = typeof messages.$inferSelect;
