CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "setlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setlist_id" uuid NOT NULL,
	"song_id" uuid,
	"position" integer NOT NULL,
	"key_override" text DEFAULT '' NOT NULL,
	"tempo_override" integer DEFAULT 0 NOT NULL,
	"duration_override" integer DEFAULT 0 NOT NULL,
	"notes_override" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"user_id" uuid,
	"name" text DEFAULT 'Untitled setlist' NOT NULL,
	"venue" text DEFAULT '' NOT NULL,
	"performance_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"title" text NOT NULL,
	"artist" text DEFAULT '' NOT NULL,
	"default_key" text DEFAULT '' NOT NULL,
	"default_tempo" integer DEFAULT 0 NOT NULL,
	"default_duration_seconds" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "setlist_items" ADD CONSTRAINT "setlist_items_setlist_id_setlists_id_fk" FOREIGN KEY ("setlist_id") REFERENCES "public"."setlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setlist_items" ADD CONSTRAINT "setlist_items_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setlists" ADD CONSTRAINT "setlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "setlist_items_setlist_idx" ON "setlist_items" USING btree ("setlist_id");--> statement-breakpoint
CREATE INDEX "setlist_items_position_idx" ON "setlist_items" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "setlists_slug_unique" ON "setlists" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "setlists_user_idx" ON "setlists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "songs_user_idx" ON "songs" USING btree ("user_id");