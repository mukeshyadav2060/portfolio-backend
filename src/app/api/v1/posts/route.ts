import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/http";
import { listPosts } from "@/lib/queries";

export const GET = handle(async (request: NextRequest) => {
  const limit = Number(request.nextUrl.searchParams.get("limit")) || undefined;
  return ok(await listPosts(limit && Math.min(limit, 50)), { cache: "public" });
});
