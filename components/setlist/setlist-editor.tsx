"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, FileDown, GripVertical, Plus, Printer, Save, Share2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SetlistWithItems } from "@/lib/setlists";
import { cn, formatDuration, parseDuration } from "@/lib/utils";

type EditorItem = SetlistWithItems["items"][number] & {
  clientId: string;
};

type LibrarySong = {
  id: string;
  title: string;
  artist: string;
  defaultKey: string;
  defaultTempo: number;
  defaultDurationSeconds: number;
  notes: string;
};

type Props = {
  initialSetlist: SetlistWithItems;
  printMode?: boolean;
};

const emptySong = {
  title: "",
  artist: "",
  key: "",
  tempo: 0,
  durationSeconds: 0,
  notes: "",
};

export function SetlistEditor({ initialSetlist, printMode = false }: Props) {
  const [name, setName] = useState(initialSetlist.name);
  const [venue, setVenue] = useState(initialSetlist.venue);
  const [performanceDate, setPerformanceDate] = useState(initialSetlist.performanceDate ?? "");
  const [items, setItems] = useState<EditorItem[]>(
    initialSetlist.items.map((item) => ({ ...item, clientId: item.id })),
  );
  const [library, setLibrary] = useState<LibrarySong[]>([]);
  const [draft, setDraft] = useState(emptySong);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [isPending, startTransition] = useTransition();
  const printRef = useRef<HTMLDivElement>(null);

  const totalDuration = useMemo(
    () => items.reduce((total, item) => total + item.durationSeconds, 0),
    [items],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const print = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${name || "set-list"}-${initialSetlist.slug}`,
  });

  useEffect(() => {
    fetch("/api/songs")
      .then((response) => (response.ok ? response.json() : []))
      .then(setLibrary)
      .catch(() => setLibrary([]));
  }, []);

  function addDraftSong() {
    if (!draft.title.trim()) return;
    setItems((current) => [
      ...current,
      {
        ...draft,
        id: crypto.randomUUID(),
        clientId: crypto.randomUUID(),
        songId: null,
        position: current.length,
      },
    ]);
    setDraft(emptySong);
    setOpen(false);
    setStatus("Unsaved changes");
  }

  function addLibrarySong(song: LibrarySong) {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        clientId: crypto.randomUUID(),
        songId: song.id,
        title: song.title,
        artist: song.artist,
        key: song.defaultKey,
        tempo: song.defaultTempo,
        durationSeconds: song.defaultDurationSeconds,
        notes: song.notes,
        position: current.length,
      },
    ]);
    setStatus("Unsaved changes");
  }

  function updateItem(clientId: string, updates: Partial<EditorItem>) {
    setItems((current) =>
      current.map((item) => (item.clientId === clientId ? { ...item, ...updates } : item)),
    );
    setStatus("Unsaved changes");
  }

  function removeItem(clientId: string) {
    setItems((current) => current.filter((item) => item.clientId !== clientId));
    setStatus("Unsaved changes");
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.clientId === active.id);
      const newIndex = current.findIndex((item) => item.clientId === over.id);
      return arrayMove(current, oldIndex, newIndex).map((item, position) => ({ ...item, position }));
    });
    setStatus("Unsaved changes");
  }

  function saveSetlist() {
    startTransition(async () => {
      setStatus("Saving...");
      const response = await fetch(`/api/setlists/${initialSetlist.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Untitled setlist",
          venue,
          performanceDate: performanceDate || null,
          items: items.map((item, position) => ({
            songId: item.songId,
            title: item.title,
            artist: item.artist,
            key: item.key,
            tempo: item.tempo,
            durationSeconds: item.durationSeconds,
            notes: item.notes,
            position,
          })),
        }),
      });
      setStatus(response.ok ? "Saved" : "Save failed");
      if (response.ok) {
        const saved = (await response.json()) as SetlistWithItems;
        setItems(saved.items.map((item) => ({ ...item, clientId: item.id })));
        fetch("/api/songs")
          .then((libraryResponse) => (libraryResponse.ok ? libraryResponse.json() : []))
          .then(setLibrary)
          .catch(() => undefined);
      }
    });
  }

  async function copyShareLink() {
    await navigator.clipboard.writeText(window.location.href.split("?")[0]);
    setStatus("Share link copied");
  }

  return (
    <main className={cn("min-h-screen", printMode && "bg-white")}>
      <div className={cn("no-print border-b border-border bg-white", printMode && "hidden")}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-black">Set List</Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-medium text-muted-foreground">{status}</span>
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Copy className="h-4 w-4" /> Copy share link
            </Button>
            <Button variant="outline" size="sm" onClick={() => print()}>
              <FileDown className="h-4 w-4" /> Export PDF
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`/s/${initialSetlist.slug}?view=print`} target="_blank">
                <Printer className="h-4 w-4" /> Print view
              </a>
            </Button>
            <Button size="sm" onClick={saveSetlist} disabled={isPending}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_18rem]">
        <section ref={printRef} className="print-sheet rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className={cn("grid gap-3 border-b border-border pb-5 md:grid-cols-[1fr_12rem_10rem_8rem]", printMode && "block")}>
            <div>
              <Label htmlFor="setlist-name" className="no-print">Setlist name</Label>
              <Input
                id="setlist-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setStatus("Unsaved changes");
                }}
                className="no-print mt-2 text-lg font-bold"
              />
              <h1 className="hidden text-4xl font-black print:block">{name}</h1>
            </div>
            <div className="no-print">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" className="mt-2" value={venue} onChange={(event) => setVenue(event.target.value)} />
            </div>
            <div className="no-print">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                className="mt-2"
                value={performanceDate}
                onChange={(event) => setPerformanceDate(event.target.value)}
              />
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Total</p>
              <p className="text-2xl font-black">{formatDuration(totalDuration)}</p>
            </div>
          </div>

          <div className="mt-4 hidden print:block">
            <p className="text-xl">{[venue, performanceDate].filter(Boolean).join(" / ")}</p>
          </div>

          <div className="no-print mt-5 flex justify-between gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4" /> Add song</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add song</DialogTitle>
                </DialogHeader>
                <SongForm draft={draft} setDraft={setDraft} onSubmit={addDraftSong} />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" onClick={() => print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((item) => item.clientId)} strategy={verticalListSortingStrategy}>
              <div className="mt-5 grid gap-3">
                {items.length === 0 ? (
                  <div className="no-print rounded-lg border border-dashed border-border p-8 text-center">
                    <p className="font-bold">No songs yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Add a song or pull one from your library.</p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <SortableSong
                      key={item.clientId}
                      item={item}
                      index={index}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        <aside className={cn("no-print rounded-lg border border-border bg-white p-4 shadow-sm", printMode && "hidden")}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">My songs</h2>
            <Share2 className="h-4 w-4 text-primary" />
          </div>
          <div className="grid max-h-[70vh] gap-2 overflow-y-auto pr-1">
            {library.length === 0 ? (
              <p className="text-sm text-muted-foreground">Saved songs appear here after you save setlists.</p>
            ) : (
              library.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => addLibrarySong(song)}
                  className="rounded-md border border-border p-3 text-left transition hover:border-primary hover:bg-muted"
                >
                  <p className="font-semibold">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist || "Unknown artist"}</p>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function SortableSong({
  item,
  index,
  onUpdate,
  onRemove,
}: {
  item: EditorItem;
  index: number;
  onUpdate: (clientId: string, updates: Partial<EditorItem>) => void;
  onRemove: (clientId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.clientId,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="print-song rounded-lg border border-border bg-white p-3 shadow-sm print:border-b print:border-l-0 print:border-r-0 print:border-t-0 print:shadow-none"
    >
      <div className="grid gap-3 lg:grid-cols-[2.5rem_1.2fr_1fr_5rem_5rem_6rem_1.4fr_4rem]">
        <button
          className="no-print flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground"
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Drag song"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 lg:col-span-2 print:col-span-2">
          <span className="mt-2 text-lg font-black">{index + 1}</span>
          <div className="w-full">
            <Input
              value={item.title}
              onChange={(event) => onUpdate(item.clientId, { title: event.target.value })}
              className="no-print font-bold"
              placeholder="Title"
            />
            <Input
              value={item.artist}
              onChange={(event) => onUpdate(item.clientId, { artist: event.target.value })}
              className="no-print mt-2"
              placeholder="Artist"
            />
            <div className="hidden print:block">
              <h2 className="text-2xl font-black">{item.title}</h2>
              <p className="text-lg text-muted-foreground">{item.artist}</p>
            </div>
          </div>
        </div>
        <Input
          value={item.key}
          onChange={(event) => onUpdate(item.clientId, { key: event.target.value })}
          className="no-print"
          placeholder="Key"
        />
        <Input
          type="number"
          value={item.tempo || ""}
          onChange={(event) => onUpdate(item.clientId, { tempo: Number(event.target.value) || 0 })}
          className="no-print"
          placeholder="BPM"
        />
        <Input
          value={formatDuration(item.durationSeconds)}
          onChange={(event) => onUpdate(item.clientId, { durationSeconds: parseDuration(event.target.value) })}
          className="no-print"
          placeholder="mm:ss"
        />
        <Textarea
          value={item.notes}
          onChange={(event) => onUpdate(item.clientId, { notes: event.target.value })}
          className="no-print min-h-10"
          placeholder="Notes"
        />
        <Button variant="ghost" size="sm" className="no-print text-destructive" onClick={() => onRemove(item.clientId)}>
          Remove
        </Button>
      </div>
      <div className="mt-2 hidden grid-cols-4 gap-4 text-lg print:grid">
        <p><strong>Key:</strong> {item.key || "-"}</p>
        <p><strong>BPM:</strong> {item.tempo || "-"}</p>
        <p><strong>Time:</strong> {formatDuration(item.durationSeconds)}</p>
        <p className="col-span-4 whitespace-pre-wrap">{item.notes}</p>
      </div>
    </article>
  );
}

function SongForm({
  draft,
  setDraft,
  onSubmit,
}: {
  draft: typeof emptySong;
  setDraft: (draft: typeof emptySong) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="song-title">Title</Label>
        <Input
          id="song-title"
          className="mt-2"
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="song-artist">Artist</Label>
        <Input
          id="song-artist"
          className="mt-2"
          value={draft.artist}
          onChange={(event) => setDraft({ ...draft, artist: event.target.value })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="song-key">Key</Label>
          <Input id="song-key" className="mt-2" value={draft.key} onChange={(event) => setDraft({ ...draft, key: event.target.value })} />
        </div>
        <div>
          <Label htmlFor="song-tempo">BPM</Label>
          <Input
            id="song-tempo"
            type="number"
            className="mt-2"
            value={draft.tempo || ""}
            onChange={(event) => setDraft({ ...draft, tempo: Number(event.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="song-duration">Duration</Label>
          <Input
            id="song-duration"
            className="mt-2"
            placeholder="3:45"
            value={draft.durationSeconds ? formatDuration(draft.durationSeconds) : ""}
            onChange={(event) => setDraft({ ...draft, durationSeconds: parseDuration(event.target.value) })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="song-notes">Notes</Label>
        <Textarea
          id="song-notes"
          className="mt-2"
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
        />
      </div>
      <Button onClick={onSubmit}><Plus className="h-4 w-4" /> Add song</Button>
    </div>
  );
}
