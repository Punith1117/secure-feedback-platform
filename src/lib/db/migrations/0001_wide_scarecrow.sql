CREATE TABLE "question_bank" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_bank" text NOT NULL,
	CONSTRAINT "question_bank_question_bank_unique" UNIQUE("question_bank")
);
--> statement-breakpoint
CREATE TABLE "template_questions" (
	"template_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	CONSTRAINT "template_questions_template_id_question_id_pk" PRIMARY KEY("template_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "template_questions" ADD CONSTRAINT "template_questions_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_questions" ADD CONSTRAINT "template_questions_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE cascade ON UPDATE no action;