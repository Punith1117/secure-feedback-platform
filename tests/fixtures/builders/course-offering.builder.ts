import { db } from "@/lib/db";
import { courseOfferings } from "@/lib/db/schema";

export async function createCourseOfferingFixture(overrides?: Partial<any>) {
  const [co] = await db
    .insert(courseOfferings)
    .values({
      id: overrides?.id ?? crypto.randomUUID(),
      userId: overrides?.userId ?? "user_admin_a",
      title: overrides?.title ?? "DBMS",
      templateId: overrides?.templateId ?? "template_basic",
    })
    .returning();

  return co;
}