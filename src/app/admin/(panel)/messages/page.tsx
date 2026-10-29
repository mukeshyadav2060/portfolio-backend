import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { MessagesInbox } from "@/components/admin/messages-inbox";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt)).limit(500);
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
      <p className="mt-1 text-sm text-muted">Everything sent through the contact form.</p>
      <MessagesInbox initial={messages} />
    </>
  );
}
