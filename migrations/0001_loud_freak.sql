CREATE TABLE "niche_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"niche" text NOT NULL,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "niche_stats_creator_id_niche_unique" UNIQUE("creator_id","niche")
);
--> statement-breakpoint
ALTER TABLE "video_templates" ALTER COLUMN "points_to_cover" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "video_templates" ALTER COLUMN "points_to_cover" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "video_templates" ALTER COLUMN "visuals_needed" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "video_templates" ALTER COLUMN "visuals_needed" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "niche_stats" ADD CONSTRAINT "niche_stats_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;