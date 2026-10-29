import { saveMessage, contactSchema } from "@/lib/contact";
import { env } from "@/lib/env";
import { HttpError, handle, ok, readJson } from "@/lib/http";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";

export const POST = handle(async (request: Request) => {
  // The frontend proxies submissions server-side and forwards the visitor's address;
  // that header is only trusted when the request carries the shared integration secret.
  const trusted = request.headers.get("x-integration-secret") === env.REVALIDATE_SECRET;
  const ip = (trusted && request.headers.get("x-visitor-ip")) || clientIp(request);
  const limit = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) throw new HttpError(429, `Too many messages. Try again in ${limit.retryAfter}s.`);

  const input = contactSchema.parse(await readJson(request));
  const row = await saveMessage(input, { ipHash: hashIp(ip), userAgent: request.headers.get("user-agent") });
  return ok({ id: row.id, receivedAt: row.createdAt }, { status: 201 });
});
