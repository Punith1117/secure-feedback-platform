ALTER TABLE "question_bank" RENAME COLUMN "question_bank" TO "question";--> statement-breakpoint
ALTER TABLE "question_bank" DROP CONSTRAINT "question_bank_question_bank_unique";--> statement-breakpoint
ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_question_unique" UNIQUE("question");