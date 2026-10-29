import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { badRequest, handle, ok } from "@/lib/http";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

export const POST = handle(async (request: Request) => {
  await requireAdmin(request);
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw badRequest("Send the file as multipart field “file”");
  const ext = ALLOWED[file.type];
  if (!ext) throw badRequest(`Unsupported type ${file.type || "unknown"}`);
  if (file.size > MAX_BYTES) throw badRequest("Files must be 8 MB or smaller");

  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "file";
  const name = `${base}-${randomBytes(4).toString("hex")}.${ext}`;

  // Serverless file systems are temporary, so production uploads go to Vercel Blob.
  if (env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${name}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      token: env.BLOB_READ_WRITE_TOKEN,
    });
    return ok({ url: blob.url, name, size: file.size, type: file.type }, { status: 201 });
  }

  const dir = path.resolve(env.UPLOAD_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return ok({ url: new URL(`/uploads/${name}`, env.PUBLIC_URL).toString(), name, size: file.size, type: file.type }, { status: 201 });
});
