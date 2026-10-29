import { requireAdmin } from "@/lib/auth";
import { handle, ok } from "@/lib/http";

export const GET = handle(async (request: Request) => ok(await requireAdmin(request)));
