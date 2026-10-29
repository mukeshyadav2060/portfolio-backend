import { env } from "./env";

/** Cache tags understood by the frontend's /api/revalidate endpoint. */
export type CacheTag = "profile" | "projects" | "experience" | "services" | "skills" | "posts" | `project:${string}` | `post:${string}`;

/**
 * Tell the frontend which cached data changed. Fire-and-forget: a failed webhook must
 * never fail the admin write, the frontend's cache lifetimes still bound staleness.
 */
export function revalidateFrontend(tags: CacheTag[]) {
  if (!env.FRONTEND_URL || tags.length === 0) return;
  const url = new URL("/api/revalidate", env.FRONTEND_URL);
  fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-revalidate-secret": env.REVALIDATE_SECRET },
    body: JSON.stringify({ tags }),
    signal: AbortSignal.timeout(5000),
  })
    .then((res) => {
      if (!res.ok) console.warn(`[revalidate] frontend responded ${res.status}`);
    })
    .catch((error) => console.warn("[revalidate] frontend unreachable:", (error as Error).message));
}
