import { notFound } from "next/navigation";
import { SetlistEditor } from "@/components/setlist/setlist-editor";
import { getSetlist } from "@/lib/setlists";

type Props = {
  params: { slug: string };
  searchParams: { view?: string };
};

export default async function SetlistPage({ params, searchParams }: Props) {
  const { slug } = params;
  const { view } = searchParams;
  const setlist = await getSetlist(slug);

  if (!setlist) {
    notFound();
  }

  return <SetlistEditor initialSetlist={setlist} printMode={view === "print"} />;
}
