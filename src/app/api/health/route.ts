import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  try {
    await db.run(sql`select 1`);
    return Response.json({ status: "ok", database: "up", time: new Date().toISOString() });
  } catch {
    return Response.json({ status: "degraded", database: "down" }, { status: 503 });
  }
}
