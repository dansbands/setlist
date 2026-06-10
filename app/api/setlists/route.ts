import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSetlist } from "@/lib/setlists";
import { getOrCreateUser } from "@/lib/users";

export async function POST() {
  try {
    const session = await auth();
    const user = await getOrCreateUser(session);
    const setlist = await createSetlist(user?.id ?? null);
    return NextResponse.json({ slug: setlist.slug });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not create setlist" }, { status: 500 });
  }
}
