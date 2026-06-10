import { beforeEach } from "vitest";
import { db } from "../../src/lib/db/index";
import { sql } from "drizzle-orm";

beforeEach(async () => {
  await db.execute(sql`
    TRUNCATE TABLE
      feedback_responses,
      feedback_submissions,
      student_access_codes,
      courses,
      course_offerings,
      faculty,
      feedback_instances,
      template_questions,
      templates,
      question_bank,
      session,
      account,
      verification,
      "user"
    RESTART IDENTITY CASCADE;
  `);
});