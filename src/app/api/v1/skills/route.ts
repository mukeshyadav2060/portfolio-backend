import { handle, ok } from "@/lib/http";
import { listSkills } from "@/lib/queries";

export const GET = handle(async () => ok(await listSkills(), { cache: "public" }));
