import { asc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { setlistItems, setlists, songs } from "@/db/schema";
import type { SetlistInput, SongInput } from "@/lib/validation";

export type SetlistWithItems = {
  id: string;
  slug: string;
  name: string;
  venue: string;
  performanceDate: string | null;
  createdAt: Date;
  items: Array<{
    id: string;
    songId: string | null;
    title: string;
    artist: string;
    key: string;
    tempo: number;
    durationSeconds: number;
    notes: string;
    position: number;
  }>;
};

export async function createSetlist(userId?: string | null) {
  const slug = nanoid(10);
  const [created] = await db
    .insert(setlists)
    .values({ slug, userId: userId ?? null })
    .returning();
  return created;
}

export async function getSetlist(slug: string): Promise<SetlistWithItems | null> {
  const [setlist] = await db.select().from(setlists).where(eq(setlists.slug, slug)).limit(1);
  if (!setlist) return null;

  const rows = await db
    .select({
      itemId: setlistItems.id,
      songId: songs.id,
      title: songs.title,
      artist: songs.artist,
      defaultKey: songs.defaultKey,
      defaultTempo: songs.defaultTempo,
      defaultDurationSeconds: songs.defaultDurationSeconds,
      songNotes: songs.notes,
      position: setlistItems.position,
      keyOverride: setlistItems.keyOverride,
      tempoOverride: setlistItems.tempoOverride,
      durationOverride: setlistItems.durationOverride,
      notesOverride: setlistItems.notesOverride,
    })
    .from(setlistItems)
    .leftJoin(songs, eq(setlistItems.songId, songs.id))
    .where(eq(setlistItems.setlistId, setlist.id))
    .orderBy(asc(setlistItems.position));

  return {
    id: setlist.id,
    slug: setlist.slug,
    name: setlist.name,
    venue: setlist.venue,
    performanceDate: setlist.performanceDate,
    createdAt: setlist.createdAt,
    items: rows.map((row) => ({
      id: row.itemId,
      songId: row.songId,
      title: row.title ?? "Untitled song",
      artist: row.artist ?? "",
      key: row.keyOverride ?? row.defaultKey ?? "",
      tempo: row.tempoOverride ?? row.defaultTempo ?? 0,
      durationSeconds: row.durationOverride ?? row.defaultDurationSeconds ?? 0,
      notes: row.notesOverride ?? row.songNotes ?? "",
      position: row.position,
    })),
  };
}

export async function updateSetlist(slug: string, payload: SetlistInput) {
  const [setlist] = await db.select().from(setlists).where(eq(setlists.slug, slug)).limit(1);
  if (!setlist) return null;

  await db
    .update(setlists)
    .set({
      name: payload.name,
      venue: payload.venue,
      performanceDate: payload.performanceDate || null,
    })
    .where(eq(setlists.id, setlist.id));

  await db.delete(setlistItems).where(eq(setlistItems.setlistId, setlist.id));

  for (const item of payload.items) {
    let songId = item.songId ?? null;
    if (!songId) {
      const [createdSong] = await db
        .insert(songs)
        .values({
          userId: setlist.userId,
          title: item.title,
          artist: item.artist,
          defaultKey: item.key,
          defaultTempo: item.tempo,
          defaultDurationSeconds: item.durationSeconds,
          notes: item.notes,
        })
        .returning();
      songId = createdSong.id;
    }

    await db.insert(setlistItems).values({
      setlistId: setlist.id,
      songId,
      position: item.position,
      keyOverride: item.key,
      tempoOverride: item.tempo,
      durationOverride: item.durationSeconds,
      notesOverride: item.notes,
    });
  }

  return getSetlist(slug);
}

export async function createSong(payload: SongInput, userId?: string | null) {
  const [song] = await db
    .insert(songs)
    .values({
      userId: userId ?? null,
      title: payload.title,
      artist: payload.artist,
      defaultKey: payload.key,
      defaultTempo: payload.tempo,
      defaultDurationSeconds: payload.durationSeconds,
      notes: payload.notes,
    })
    .returning();
  return song;
}
