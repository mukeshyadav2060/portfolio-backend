import { handle, ok } from "@/lib/http";
import { getProfile } from "@/lib/queries";

export const GET = handle(async () => ok(await getProfile(), { cache: "public" }));
