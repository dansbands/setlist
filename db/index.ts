import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV !== "test") {
  console.warn("DATABASE_URL is not set. Database-backed routes will fail until configured.");
}

const sql = neon(databaseUrl ?? "postgresql://user:password@localhost:5432/setlist");

export const db = drizzle(sql, { schema });
