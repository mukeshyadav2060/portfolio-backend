import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

/** Serves files written by the upload endpoint (public/ is frozen at build time). */
export async function GET(_request: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const segments = (await ctx.params).path;
  const root = path.resolve(env.UPLOAD_DIR);
  const file = path.resolve(root, ...segments);
  if (!file.startsWith(root + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    const ext = path.extname(file).slice(1).toLowerCase();
    return new Response(new Uint8Array(await readFile(file)), {
      headers: {
        "content-type": TYPES[ext] ?? "application/octet-stream",
        "content-length": String(info.size),
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
        ...(ext === "svg" ? { "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
