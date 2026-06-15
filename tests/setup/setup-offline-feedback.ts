import { buildFullFeedbackInstanceScenario } from "../fixtures/scenarios/feedback-instance.scenario";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function clearDatabase() {
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
}

export async function setupOfflineFeedbackScenario() {
  return buildFullFeedbackInstanceScenario();
}
