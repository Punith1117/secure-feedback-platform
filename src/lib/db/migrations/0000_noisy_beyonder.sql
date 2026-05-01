CREATE TABLE "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"instance_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"join_code" varchar(8) NOT NULL,
	"title" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_instances_join_code_unique" UNIQUE("join_code")
);
--> statement-breakpoint
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
ALTER TABLE "courses" ADD CONSTRAINT "courses_instance_id_feedback_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."feedback_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_instances" ADD CONSTRAINT "feedback_instances_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_access_codes" ADD CONSTRAINT "student_access_codes_instance_id_feedback_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."feedback_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_instance_id_idx" ON "courses" USING btree ("instance_id");--> statement-breakpoint
CREATE INDEX "feedback_instances_admin_id_idx" ON "feedback_instances" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "student_access_codes_instance_id_idx" ON "student_access_codes" USING btree ("instance_id");