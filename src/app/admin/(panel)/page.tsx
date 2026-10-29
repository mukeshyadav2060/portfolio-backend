import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/db";

export const metadata = { title: "Overview" };

export default async function Overview() {
  const n = async (table: typeof schema.projects | typeof schema.posts | typeof schema.experience | typeof schema.skills) =>
    (await db.select({ n: count() }).from(table))[0].n;
  const [projects, posts, experience, skills, unread, recent] = await Promise.all([
    n(schema.projects),
    n(schema.posts),
    n(schema.experience),
    n(schema.skills),
    db
      .select({ n: count() })
      .from(schema.messages)
      .where(eq(schema.messages.read, false))
      .then((r) => r[0].n),
    db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt)).limit(5),
  ]);

  const tiles = [
    { label: "Unread messages", value: unread, href: "/admin/messages" },
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Posts", value: posts, href: "/admin/posts" },
    { label: "Roles", value: experience, href: "/admin/experience" },
    { label: "Skills", value: skills, href: "/admin/skills" },
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-muted">Edits publish to the site within seconds through cache revalidation.</p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-lg border border-line bg-panel p-4 transition-colors hover:border-muted/40">
            <div className="text-2xl font-semibold tabular-nums">{t.value}</div>
            <div className="mt-1 text-sm text-muted">{t.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-semibold">Latest messages</h2>
      {recent.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No messages yet. Submissions from the contact form land here.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-panel">
          {recent.map((m) => (
            <li key={m.id} className="flex items-start gap-4 px-4 py-3 text-sm">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${m.read ? "bg-line" : "bg-accent"}`} aria-label={m.read ? "Read" : "Unread"} />
              <div className="min-w-0">
                <p className="font-medium">
                  {m.name} <span className="font-normal text-muted">· {m.email}</span>
                </p>
                <p className="mt-0.5 truncate text-muted">{m.message}</p>
              </div>
              <time className="ml-auto shrink-0 text-xs text-muted">{new Date(m.createdAt).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
