import { handle, ok } from "@/lib/http";
import { getSite } from "@/lib/queries";

export const GET = handle(async () => ok(await getSite(), { cache: "public" }));
