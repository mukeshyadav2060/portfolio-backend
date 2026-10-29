import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { env } from "@/lib/env";

type DB = LibSQLDatabase<typeof schema>;

// Reuse one client across hot reloads in development.
const globalForDb = globalThis as unknown as { __libsql?: Client; __db?: DB };

const client =
  globalForDb.__libsql ??
  createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN || undefined });

export const db: DB = globalForDb.__db ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__libsql = client;
  globalForDb.__db = db;
}

export { schema };
