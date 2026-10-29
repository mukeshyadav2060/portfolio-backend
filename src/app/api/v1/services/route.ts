import { handle, ok } from "@/lib/http";
import { listServices } from "@/lib/queries";

export const GET = handle(async () => ok(await listServices(), { cache: "public" }));
