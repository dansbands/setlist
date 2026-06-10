import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
});

export const songs = pgTable(
  "songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    artist: text("artist").notNull().default(""),
    defaultKey: text("default_key").notNull().default(""),
    defaultTempo: integer("default_tempo").notNull().default(0),
    defaultDurationSeconds: integer("default_duration_seconds").notNull().default(0),
    notes: text("notes").notNull().default(""),
  },
  (table) => ({
    userIdx: index("songs_user_idx").on(table.userId),
  }),
);

export const setlists = pgTable(
  "setlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull().default("Untitled setlist"),
    venue: text("venue").notNull().default(""),
    performanceDate: text("performance_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugUnique: uniqueIndex("setlists_slug_unique").on(table.slug),
    userIdx: index("setlists_user_idx").on(table.userId),
  }),
);

export const setlistItems = pgTable(
  "setlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    setlistId: uuid("setlist_id")
      .notNull()
      .references(() => setlists.id, { onDelete: "cascade" }),
    songId: uuid("song_id").references(() => songs.id, { onDelete: "set null" }),
    position: integer("position").notNull(),
    keyOverride: text("key_override").notNull().default(""),
    tempoOverride: integer("tempo_override").notNull().default(0),
    durationOverride: integer("duration_override").notNull().default(0),
    notesOverride: text("notes_override").notNull().default(""),
  },
  (table) => ({
    setlistIdx: index("setlist_items_setlist_idx").on(table.setlistId),
    positionIdx: index("setlist_items_position_idx").on(table.position),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  songs: many(songs),
  setlists: many(setlists),
}));

export const songsRelations = relations(songs, ({ one, many }) => ({
  user: one(users, {
    fields: [songs.userId],
    references: [users.id],
  }),
  setlistItems: many(setlistItems),
}));

export const setlistsRelations = relations(setlists, ({ one, many }) => ({
  user: one(users, {
    fields: [setlists.userId],
    references: [users.id],
  }),
  items: many(setlistItems),
}));

export const setlistItemsRelations = relations(setlistItems, ({ one }) => ({
  setlist: one(setlists, {
    fields: [setlistItems.setlistId],
    references: [setlists.id],
  }),
  song: one(songs, {
    fields: [setlistItems.songId],
    references: [songs.id],
  }),
}));
