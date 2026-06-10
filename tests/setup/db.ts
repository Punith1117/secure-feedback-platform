import { beforeEach } from "vitest";
import { db } from "@/lib/db/index";
import { sql } from "drizzle-orm";
import { seedUsers } from "../fixtures/user.fixture";

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

  await seedUsers()
});