-- Convert user_id from uuid to text to match user.id type
ALTER TABLE "feedback_instances" ALTER COLUMN "user_id" TYPE text USING user_id::text;--> statement-breakpoint
-- Add the foreign key constraint with correct types
ALTER TABLE "feedback_instances" ADD CONSTRAINT "feedback_instances_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
