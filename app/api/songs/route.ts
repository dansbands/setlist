import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { songs } from "@/db/schema";
import { createSong } from "@/lib/setlists";
import { getOrCreateUser } from "@/lib/users";
import { songInputSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await auth();
    const user = await getOrCreateUser(session);
    if (!user) return NextResponse.json([]);

    const library = await db
      .select()
      .from(songs)
      .where(eq(songs.userId, user.id))
      .orderBy(asc(songs.title));
    return NextResponse.json(library);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load songs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const user = await getOrCreateUser(session);
    const payload = songInputSchema.parse(await request.json());
    const song = await createSong(payload, user?.id ?? null);
    return NextResponse.json(song);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save song" }, { status: 400 });
  }
}
