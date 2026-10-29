import { handle, ok } from "@/lib/http";
import { listExperience } from "@/lib/queries";

export const GET = handle(async () => ok(await listExperience(), { cache: "public" }));
