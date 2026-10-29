import { requireAdmin } from "@/lib/auth";
import { handle, notFound, ok, readJson } from "@/lib/http";
import { isResourceName } from "@/lib/resources/fields";
import { cacheTagsFor, createResource, listResource } from "@/lib/resources/server";
import { revalidateFrontend } from "@/lib/revalidate";

type Ctx = RouteContext<"/api/v1/admin/[resource]">;

async function resourceFrom(ctx: Ctx) {
  const { resource } = await ctx.params;
  if (!isResourceName(resource)) throw notFound("Resource type");
  return resource;
}

export const GET = handle(async (request: Request, ctx: Ctx) => {
  await requireAdmin(request);
  return ok(await listResource(await resourceFrom(ctx)));
});

export const POST = handle(async (request: Request, ctx: Ctx) => {
  await requireAdmin(request);
  const name = await resourceFrom(ctx);
  const row = await createResource(name, await readJson(request));
  revalidateFrontend(cacheTagsFor(name, row));
  return ok(row, { status: 201 });
});
