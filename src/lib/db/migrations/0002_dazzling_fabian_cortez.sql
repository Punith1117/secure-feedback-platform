ALTER TABLE "feedback_instances" ADD COLUMN "admin_id" uuid;--> statement-breakpoint
ALTER TABLE "feedback_instances" ADD CONSTRAINT "feedback_instances_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_instances_admin_id_idx" ON "feedback_instances" USING btree ("admin_id");