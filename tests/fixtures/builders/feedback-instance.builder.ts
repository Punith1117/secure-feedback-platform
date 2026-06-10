import { db } from "@/lib/db";
import { feedbackInstances, studentAccessCodes } from "@/lib/db/schema";
import { nanoid } from "nanoid";

export async function createFeedbackInstanceFixture(overrides?: Partial<any>) {
  const instanceId = overrides?.id ?? crypto.randomUUID();

  const [instance] = await db
    .insert(feedbackInstances)
    .values({
      id: instanceId,
      userId: overrides?.userId ?? "user_admin_a",
      joinCode: overrides?.joinCode ?? nanoid(8),
      title: overrides?.title ?? "Test Instance",
      isActive: overrides?.isActive ?? true,
    })
    .returning();

  // optional access codes
  if (overrides?.accessCodes !== false) {
    await db.insert(studentAccessCodes).values([
      {
        instanceId: instance.id,
        code: "CODE1234",
        used: false,
      },
      {
        instanceId: instance.id,
        code: "CODE5678",
        used: false,
      },
    ]);
  }

  return instance;
}