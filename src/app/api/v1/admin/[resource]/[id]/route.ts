import { requireAdmin } from "@/lib/auth";
import { badRequest, handle, notFound, ok, readJson } from "@/lib/http";
import { isResourceName } from "@/lib/resources/fields";
import { cacheTagsFor, deleteResource, getResource, updateResource } from "@/lib/resources/server";
import { revalidateFrontend } from "@/lib/revalidate";

type Ctx = RouteContext<"/api/v1/admin/[resource]/[id]">;

async function target(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  if (!isResourceName(resource)) throw notFound("Resource type");
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) throw badRequest("Invalid id");
  return { name: resource, id: numericId };
}

export const GET = handle(async (request: Request, ctx: Ctx) => {
  await requireAdmin(request);
  const { name, id } = await target(ctx);
  return ok(await getResource(name, id));
});

export const PUT = handle(async (request: Request, ctx: Ctx) => {
  await requireAdmin(request);
  const { name, id } = await target(ctx);
  const { previous, row } = await updateResource(name, id, await readJson(request));
  // Invalidate both slugs when a slug changes.
  revalidateFrontend(cacheTagsFor(name, previous, row));
  return ok(row);
});

export const PATCH = PUT;

export const DELETE = handle(async (request: Request, ctx: Ctx) => {
  await requireAdmin(request);
  const { name, id } = await target(ctx);
  const row = await deleteResource(name, id);
  revalidateFrontend(cacheTagsFor(name, row));
  return ok({ deleted: id });
});
