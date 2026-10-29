import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/http";
import { listProjects } from "@/lib/queries";

export const GET = handle(async (request: NextRequest) => {
  const featured = request.nextUrl.searchParams.get("featured");
  return ok(await listProjects({ featured: featured === "1" || featured === "true" }), { cache: "public" });
});
