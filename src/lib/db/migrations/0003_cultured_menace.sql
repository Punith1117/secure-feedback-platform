CREATE TABLE "course_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"template_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "course_offering_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_offerings_user_id_idx" ON "course_offerings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "course_offerings_template_id_idx" ON "course_offerings" USING btree ("template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_offerings_user_title_unique" ON "course_offerings" USING btree ("user_id","title");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_course_offering_id_course_offerings_id_fk" FOREIGN KEY ("course_offering_id") REFERENCES "public"."course_offerings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_course_offering_id_idx" ON "courses" USING btree ("course_offering_id");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_instance_course_unique" ON "courses" USING btree ("instance_id","course_offering_id");--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "title";