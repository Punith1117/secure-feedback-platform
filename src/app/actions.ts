"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { feedbackInstances, studentAccessCodes } from "@/lib/db/schema";

export async function createFeedbackInstance(title: string, numberOfStudents: number) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return { success: false, error: "Title is required" };
  }

  if (!numberOfStudents || numberOfStudents < 1) {
    return { success: false, error: "Number of students must be at least 1" };
  }

  const joinCode = nanoid(8);

  try {
    const [instance] = await db.insert(feedbackInstances).values({
      adminId: "80cb8263-54ad-4b94-86a2-166d73ae96e4",
      title: trimmedTitle,
      joinCode,
      // isActive, createdAt, updatedAt rely on database defaults
    }).returning();

    // Generate student access codes
    const accessCodes = Array.from({ length: numberOfStudents }, () => ({
      instanceId: instance.id,
      code: nanoid(8),
      // used, usedAt, createdAt rely on database defaults
    }));

    await db.insert(studentAccessCodes).values(accessCodes);

    return { success: true, joinCode };
  } catch (error) {
    console.error("Failed to create feedback instance:", error);
    return { success: false, error: "Failed to create feedback instance" };
  }
}
