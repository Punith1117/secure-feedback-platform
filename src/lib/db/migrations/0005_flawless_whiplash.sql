ALTER TABLE "admin" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "admin" CASCADE;--> statement-breakpoint
ALTER TABLE "feedback_instances" RENAME COLUMN "admin_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "feedback_instances" DROP CONSTRAINT "feedback_instances_admin_id_admin_id_fk";
--> statement-breakpoint
DROP INDEX "feedback_instances_admin_id_idx";--> statement-breakpoint
ALTER TABLE "feedback_instances" ADD CONSTRAINT "feedback_instances_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_instances_user_id_idx" ON "feedback_instances" USING btree ("user_id");