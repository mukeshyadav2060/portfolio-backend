import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { handle, ok, readJson } from "@/lib/http";
import { getProfile } from "@/lib/queries";
import { profileValidator } from "@/lib/resources/server";
import { revalidateFrontend } from "@/lib/revalidate";

export const GET = handle(async (request: Request) => {
  await requireAdmin(request);
  return ok(await getProfile());
});

export const PUT = handle(async (request: Request) => {
  await requireAdmin(request);
  const data = profileValidator.parse(await readJson(request));
  await db
    .insert(schema.profile)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({
      target: schema.profile.id,
      set: { ...data, updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))` },
    });
  revalidateFrontend(["profile"]);
  const [row] = await db.select().from(schema.profile).where(eq(schema.profile.id, 1));
  return ok(row);
});
