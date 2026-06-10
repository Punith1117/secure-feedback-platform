import { db } from "@/lib/db";
import { user, templates, questionBank, templateQuestions } from "@/lib/db/schema";

export async function seedBaseData() {
  await db.insert(user).values([
    {
      id: "user_admin_a",
      name: "Admin A",
      email: "adminA@test.com",
    },
  ]);

  await db.insert(templates).values([
    {
      id: "template_basic",
      name: "Basic Template",
    },
  ]);

  await db.insert(questionBank).values([
    { id: "q1", question: "Teaching quality?" },
    { id: "q2", question: "Clarity?" },
  ]);

  await db.insert(templateQuestions).values([
    { templateId: "template_basic", questionId: "q1" },
    { templateId: "template_basic", questionId: "q2" },
  ]);
}