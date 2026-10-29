import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { env } from "./env";
import { SESSION_COOKIE } from "./auth-cookie";
import { unauthorized } from "./http";

export { SESSION_COOKIE };
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const key = new TextEncoder().encode(env.AUTH_SECRET);

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkCredentials(email: string, password: string) {
  return safeEqual(email.toLowerCase(), env.ADMIN_EMAIL.toLowerCase()) && safeEqual(password, env.ADMIN_PASSWORD);
}

export async function createSession(email: string) {
  const token = await new SignJWT({ sub: email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.role === "admin" ? { email: String(payload.sub) } : null;
  } catch {
    return null;
  }
}

export async function getSession() {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Accepts either the admin session cookie or `Authorization: Bearer <ADMIN_API_TOKEN>`. */
export async function requireAdmin(request: Request) {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ") && env.ADMIN_API_TOKEN) {
    if (safeEqual(header.slice(7), env.ADMIN_API_TOKEN)) return { email: "api-token" };
  }
  const session = await getSession();
  if (!session) throw unauthorized();
  return session;
}
