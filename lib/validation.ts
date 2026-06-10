import { z } from "zod";

export const songInputSchema = z.object({
  title: z.string().min(1).max(160),
  artist: z.string().max(160).optional().default(""),
  key: z.string().max(24).optional().default(""),
  tempo: z.coerce.number().int().min(0).max(320).optional().default(0),
  durationSeconds: z.coerce.number().int().min(0).max(60 * 60).optional().default(0),
  notes: z.string().max(2000).optional().default(""),
});

export const setlistItemInputSchema = songInputSchema.extend({
  id: z.string().optional(),
  songId: z.string().optional().nullable(),
  position: z.number().int().min(0),
});

export const setlistInputSchema = z.object({
  name: z.string().min(1).max(160),
  venue: z.string().max(160).optional().default(""),
  performanceDate: z.string().optional().nullable(),
  items: z.array(setlistItemInputSchema).default([]),
});

export type SongInput = z.infer<typeof songInputSchema>;
export type SetlistInput = z.infer<typeof setlistInputSchema>;
