import { handle, ok } from "@/lib/http";
import { getPost } from "@/lib/queries";

export const GET = handle(async (_request: Request, ctx: RouteContext<"/api/v1/posts/[slug]">) => {
  const { slug } = await ctx.params;
  return ok(await getPost(slug), { cache: "public" });
});
