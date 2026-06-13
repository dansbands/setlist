import { NextResponse } from "next/server";
import { getSetlist, updateSetlist } from "@/lib/setlists";
import { setlistInputSchema } from "@/lib/validation";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const setlist = await getSetlist(slug);
    if (!setlist) {
      return NextResponse.json({ error: "Setlist not found" }, { status: 404 });
    }
    return NextResponse.json(setlist);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load setlist" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const payload = setlistInputSchema.parse(body);
    const setlist = await updateSetlist(slug, payload);
    if (!setlist) {
      return NextResponse.json({ error: "Setlist not found" }, { status: 404 });
    }
    return NextResponse.json(setlist);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save setlist" }, { status: 400 });
  }
}
