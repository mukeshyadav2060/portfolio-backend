/**
 * Copies the local database (and every file it references in UPLOAD_DIR) to production:
 * rows go to DATABASE_URL (Turso), files go to Vercel Blob and their URLs are rewritten.
 * Replaces all content in the target database. Safe to run again.
 *
 *   DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… BLOB_READ_WRITE_TOKEN=… npm run db:push-local
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type InValue } from "@libsql/client";
import { put } from "@vercel/blob";

const sourceUrl = process.env.SOURCE_DATABASE_URL ?? "file:./data/portfolio.db";
const targetUrl = process.env.DATABASE_URL ?? "";
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "./data/uploads");

if (!targetUrl.startsWith("libsql://")) throw new Error("Set DATABASE_URL to the Turso database (libsql://…)");
if (!blobToken) throw new Error("Set BLOB_READ_WRITE_TOKEN (Vercel → Storage → your Blob store → .env.local tab)");

const source = createClient({ url: sourceUrl });
const target = createClient({ url: targetUrl, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

// Matches both absolute (http://localhost:4000/uploads/x.webp) and relative (/uploads/x.webp) links.
const UPLOAD_LINK = /(?:https?:\/\/[^\s"'()<>]*?)?\/uploads\/([a-z0-9-]+\.[a-z0-9]+)/gi;
const uploaded = new Map<string, string>();

async function upload(name: string) {
  if (!uploaded.has(name)) {
    const ext = path.extname(name).slice(1).toLowerCase();
    const blob = await put(`uploads/${name}`, await readFile(path.join(uploadDir, name)), {
      access: "public",
      contentType: TYPES[ext] ?? "application/octet-stream",
      addRandomSuffix: false,
      allowOverwrite: true,
      token: blobToken,
    });
    uploaded.set(name, blob.url);
    console.log(`  ↑ ${name}`);
  }
  return uploaded.get(name)!;
}

async function rewrite(value: InValue): Promise<InValue> {
  if (typeof value !== "string") return value;
  const names = [...value.matchAll(UPLOAD_LINK)].map((m) => m[1]).filter((n) => existsSync(path.join(uploadDir, n)));
  for (const name of names) await upload(name);
  return value.replace(UPLOAD_LINK, (link, name: string) => uploaded.get(name) ?? link);
}

const tables = (
  await source.execute("select name from sqlite_master where type = 'table' and name not like 'sqlite_%' and name not like '__drizzle%'")
).rows.map((r) => String(r.name));

const statements: { sql: string; args: InValue[] }[] = [];
for (const table of tables) {
  const { columns, rows } = await source.execute(`select * from "${table}"`);
  statements.push({ sql: `delete from "${table}"`, args: [] });
  for (const row of rows) {
    const args = await Promise.all(columns.map((c) => rewrite(row[c] as InValue)));
    statements.push({
      sql: `insert into "${table}" (${columns.map((c) => `"${c}"`).join(", ")}) values (${columns.map(() => "?").join(", ")})`,
      args,
    });
  }
  console.log(`✓ ${table}: ${rows.length} rows`);
}

await target.batch(statements, "write");
console.log(`✓ copied ${tables.length} tables and ${uploaded.size} files to ${targetUrl}`);
source.close();
target.close();
