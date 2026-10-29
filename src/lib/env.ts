import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().default("file:./data/portfolio.db"),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  ADMIN_EMAIL: z.string().default("admin@example.com"),
  ADMIN_PASSWORD: z.string().default("change-me"),
  /** Secret used to sign admin session cookies. Must be at least 32 characters in production. */
  AUTH_SECRET: z.string().default("dev-only-secret-change-me-dev-only-secret"),
  /** Optional bearer token for scripted access to the admin API. */
  ADMIN_API_TOKEN: z.string().optional(),
  /** Comma-separated origins allowed to call the public API from the browser. */
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  /** Frontend base URL used for on-demand revalidation webhooks. */
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  REVALIDATE_SECRET: z.string().default("dev-revalidate-secret"),
  /** Public base URL of this backend, used to build absolute upload URLs. */
  PUBLIC_URL: z.string().default("http://localhost:4000"),
  UPLOAD_DIR: z.string().default("./data/uploads"),
  /** Set on Vercel (by connecting a Blob store) to keep uploads in Vercel Blob instead of on disk. */
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  /** Optional: forward contact messages by email through Resend. */
  RESEND_API_KEY: z.string().optional(),
  CONTACT_NOTIFY_EMAIL: z.string().optional(),
});

export const env = schema.parse(process.env);

if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
  if (env.AUTH_SECRET.startsWith("dev-only") || env.ADMIN_PASSWORD === "change-me") {
    console.warn("[env] AUTH_SECRET / ADMIN_PASSWORD are using development defaults. Set them before deploying.");
  }
}

export const corsOrigins = env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
