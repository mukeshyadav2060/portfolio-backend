import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { handle, ok } from "@/lib/http";

export const GET = handle(async (request: Request) => {
  await requireAdmin(request);
  return ok(await db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt)).limit(500));
});
