ALTER TABLE "feedback_responses"
ALTER COLUMN "rating"
SET DATA TYPE smallint
USING (
  CASE
    WHEN rating = 'bad' THEN 1
    WHEN rating = 'average' THEN 2
    WHEN rating = 'good' THEN 3
  END
);

ALTER TABLE "feedback_responses"
ADD COLUMN "question_id" uuid;

ALTER TABLE "feedback_responses"
ADD CONSTRAINT "feedback_responses_question_id_question_bank_id_fk"
FOREIGN KEY ("question_id")
REFERENCES "public"."question_bank"("id")
ON DELETE cascade
ON UPDATE no action;

CREATE INDEX "feedback_responses_submission_id_idx"
ON "feedback_responses" USING btree ("submission_id");

CREATE INDEX "feedback_responses_course_id_idx"
ON "feedback_responses" USING btree ("course_id");

CREATE INDEX "feedback_responses_question_id_idx"
ON "feedback_responses" USING btree ("question_id");

ALTER TABLE "feedback_responses"
DROP COLUMN "question_type";

DROP TYPE "public"."question_type";

DROP TYPE "public"."rating";