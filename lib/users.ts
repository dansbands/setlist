import { eq } from "drizzle-orm";
import type { Session } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function getOrCreateUser(session: Session | null) {
  const email = session?.user?.email;
  if (!email) return null;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      email,
      name: session.user?.name ?? null,
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  if (created) return created;

  const [after] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return after ?? null;
}
