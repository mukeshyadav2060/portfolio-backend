import { count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { handle, ok } from "@/lib/http";

type Countable =
  | typeof schema.projects
  | typeof schema.posts
  | typeof schema.experience
  | typeof schema.skills
  | typeof schema.services
  | typeof schema.messages;

const total = async (table: Countable) => (await db.select({ n: count() }).from(table))[0].n;

export const GET = handle(async (request: Request) => {
  await requireAdmin(request);
  const [projects, posts, experience, skills, services, messages, unread] = await Promise.all([
    total(schema.projects),
    total(schema.posts),
    total(schema.experience),
    total(schema.skills),
    total(schema.services),
    total(schema.messages),
    db
      .select({ n: count() })
      .from(schema.messages)
      .where(eq(schema.messages.read, false))
      .then((r) => r[0].n),
  ]);
  return ok({ projects, posts, experience, skills, services, messages, unread });
});
