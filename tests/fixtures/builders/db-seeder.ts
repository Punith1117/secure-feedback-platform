import { db } from "@/lib/db";
import { templates, questionBank, templateQuestions } from "@/lib/db/schema";
import { randomUUID } from "crypto";

export async function seedBaseData() {
  const templateId = randomUUID();
  const q1 = randomUUID();
  const q2 = randomUUID();

  await db.insert(templates).values([
    {
      id: templateId,
      name: "Basic Template",
    },
  ]);

  await db.insert(questionBank).values([
    { id: q1, question: "Teaching quality?" },
    { id: q2, question: "Clarity?" },
  ]);

  await db.insert(templateQuestions).values([
    { templateId, questionId: q1 },
    { templateId, questionId: q2 },
  ]);

  return {
    templateId,
    q1,
    q2,
  };
}