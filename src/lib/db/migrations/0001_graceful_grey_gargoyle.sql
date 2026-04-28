CREATE TABLE "student_access_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instance_id" uuid NOT NULL,
	"code" varchar(8) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_access_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "student_access_codes" ADD CONSTRAINT "student_access_codes_instance_id_feedback_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."feedback_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "student_access_codes_instance_id_idx" ON "student_access_codes" USING btree ("instance_id");