CREATE TYPE "public"."question_type" AS ENUM('lecture_quality', 'course_content');--> statement-breakpoint
CREATE TYPE "public"."rating" AS ENUM('good', 'average', 'bad');--> statement-breakpoint
CREATE TABLE "feedback_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"question_type" "question_type" NOT NULL,
	"rating" "rating" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instance_id" uuid NOT NULL,
	"access_code_id" uuid NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_submission_id_feedback_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."feedback_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_instance_id_feedback_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."feedback_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_access_code_id_student_access_codes_id_fk" FOREIGN KEY ("access_code_id") REFERENCES "public"."student_access_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "feedback_submissions_access_code_unique" ON "feedback_submissions" USING btree ("access_code_id");--> statement-breakpoint
CREATE INDEX "feedback_submissions_instance_id_idx" ON "feedback_submissions" USING btree ("instance_id");