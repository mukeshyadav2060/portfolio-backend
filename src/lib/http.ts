import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what = "Resource") => new HttpError(404, `${what} not found`);
export const badRequest = (message: string, details?: unknown) => new HttpError(400, message, details);
export const unauthorized = () => new HttpError(401, "Unauthorized");

type Init = { status?: number; cache?: "public" | "none"; maxAge?: number };

/** JSON response in the `{ data }` envelope every endpoint uses. */
export function ok<T>(data: T, { status = 200, cache = "none", maxAge = 60 }: Init = {}) {
  const headers: HeadersInit =
    cache === "public"
      ? { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 10}` }
      : { "Cache-Control": "no-store" };
  return NextResponse.json({ data }, { status, headers });
}

export function fail(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: { message: error.message, details: error.details ?? null } },
      { status: error.status },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { message: "Validation failed", details: z.flattenError(error).fieldErrors } },
      { status: 422 },
    );
  }
  console.error("[api] unhandled error", error);
  return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
}

/** Wrap a route handler so thrown HttpError / ZodError values become proper JSON responses. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (error) {
      return fail(error);
    }
  };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON");
  }
}
