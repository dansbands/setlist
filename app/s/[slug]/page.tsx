import { notFound } from "next/navigation";
import { SetlistEditor } from "@/components/setlist/setlist-editor";
import { getSetlist } from "@/lib/setlists";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function SetlistPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { view } = await searchParams;
  const setlist = await getSetlist(slug);

  if (!setlist) {
    notFound();
  }

  return <SetlistEditor initialSetlist={setlist} printMode={view === "print"} />;
}
