import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { handle, notFound, ok, readJson } from "@/lib/http";

type Ctx = RouteContext<"/api/v1/admin/messages/[id]">;
const idOf = async (ctx: Ctx) => z.coerce.number().int().positive().parse((await ctx.params).id);

export const PATCH = handle(async (request: Request, ctx: Ctx) => {
  await requireAdmin(request);
  const { read } = z.object({ read: z.boolean() }).parse(await readJson(request));
  const [row] = await db.update(schema.messages).set({ read }).where(eq(schema.messages.id, await idOf(ctx))).returning();
  if (!row) throw notFound("Message");
  return ok(row);
});

export const DELETE = handle(async (request: Request, ctx: Ctx) => {
  await requireAdmin(request);
  const id = await idOf(ctx);
  await db.delete(schema.messages).where(eq(schema.messages.id, id));
  return ok({ deleted: id });
});
