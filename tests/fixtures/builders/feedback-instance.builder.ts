import { db } from "@/lib/db";
import { feedbackInstances, studentAccessCodes } from "@/lib/db/schema";
import { nanoid } from "nanoid";

type FeedbackInstanceFixtureInput = {
  id?: string;
  userId?: string;
  joinCode?: string;
  title?: string;
  isActive?: boolean;

  accessCodes?: false | {
    count?: number;
    codes?: string[]; // optional explicit codes for deterministic tests
  };
};

export async function createFeedbackInstanceFixture(
  overrides: FeedbackInstanceFixtureInput = {},
) {
  const instanceId = overrides.id ?? crypto.randomUUID();

  const [instance] = await db
    .insert(feedbackInstances)
    .values({
      id: instanceId,
      userId: overrides.userId ?? "user_admin_a",
      joinCode: overrides.joinCode ?? nanoid(8),
      title: overrides.title ?? "Test Instance",
      isActive: overrides.isActive ?? true,
    })
    .returning();

  // Access codes (optional)
  if (overrides.accessCodes !== false) {
    const count = overrides.accessCodes?.count ?? 2;

    const codes =
      overrides.accessCodes?.codes ??
      Array.from({ length: count }).map(() => nanoid(8));

    await db.insert(studentAccessCodes).values(
      codes.map((code) => ({
        id: crypto.randomUUID(),
        instanceId: instance.id,
        code,
        used: false,
      })),
    );
  }

  return instance;
}