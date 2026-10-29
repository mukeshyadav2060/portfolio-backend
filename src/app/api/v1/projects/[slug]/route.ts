import { handle, ok } from "@/lib/http";
import { getProject } from "@/lib/queries";

export const GET = handle(async (_request: Request, ctx: RouteContext<"/api/v1/projects/[slug]">) => {
  const { slug } = await ctx.params;
  return ok(await getProject(slug), { cache: "public" });
});
