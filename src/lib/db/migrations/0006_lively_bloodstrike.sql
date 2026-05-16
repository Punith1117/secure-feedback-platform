CREATE TABLE "faculty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "faculty_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "faculty_user_id_idx" ON "faculty" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "faculty_user_name_unique" ON "faculty" USING btree ("user_id","name");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_faculty_id_idx" ON "courses" USING btree ("faculty_id");