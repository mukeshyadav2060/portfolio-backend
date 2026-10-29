import { z } from "zod";
import { checkCredentials, createSession } from "@/lib/auth";
import { HttpError, handle, ok, readJson } from "@/lib/http";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const body = z.object({ email: z.string().trim(), password: z.string() });

export const POST = handle(async (request: Request) => {
  const limit = rateLimit(`login:${clientIp(request)}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) throw new HttpError(429, `Too many attempts. Try again in ${limit.retryAfter}s.`);
  const { email, password } = body.parse(await readJson(request));
  if (!checkCredentials(email, password)) throw new HttpError(401, "Wrong email or password");
  await createSession(email);
  return ok({ email });
});
