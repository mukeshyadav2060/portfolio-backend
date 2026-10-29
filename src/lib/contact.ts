import "server-only";
import { z } from "zod";
import { db, schema } from "@/db";
import { env } from "./env";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell me your name").max(120),
  email: z.email("That email doesn't look right").max(200),
  company: z.string().trim().max(120).optional().transform((v) => v || null),
  budget: z.string().trim().max(60).optional().transform((v) => v || null),
  message: z.string().trim().min(10, "A little more detail, please").max(5000),
  /** Honeypot: real visitors never see or fill this field. */
  website: z.string().max(0).optional(),
});

export async function saveMessage(input: z.infer<typeof contactSchema>, meta: { ipHash: string; userAgent: string | null }) {
  const { website: _hp, ...data } = input;
  const [row] = await db
    .insert(schema.messages)
    .values({ ...data, ipHash: meta.ipHash, userAgent: meta.userAgent?.slice(0, 300) ?? null })
    .returning({ id: schema.messages.id, createdAt: schema.messages.createdAt });
  void notify(data);
  return row;
}

async function notify(data: { name: string; email: string; company: string | null; message: string }) {
  if (!env.RESEND_API_KEY || !env.CONTACT_NOTIFY_EMAIL) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: [env.CONTACT_NOTIFY_EMAIL],
        reply_to: data.email,
        subject: `New message from ${data.name}${data.company ? ` (${data.company})` : ""}`,
        text: `${data.message}\n\n— ${data.name} <${data.email}>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.warn("[contact] email notification failed:", (error as Error).message);
  }
}
