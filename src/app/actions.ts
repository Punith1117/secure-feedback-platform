"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { feedbackInstances } from "@/lib/db/schema";

export async function createFeedbackInstance(title: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return { success: false, error: "Title is required" };
  }

  const joinCode = nanoid(8);

  try {
    await db.insert(feedbackInstances).values({
      title: trimmedTitle,
      joinCode,
      // isActive, createdAt, updatedAt rely on database defaults
    });

    return { success: true, joinCode };
  } catch (error) {
    console.error("Failed to create feedback instance:", error);
    return { success: false, error: "Failed to create feedback instance" };
  }
}
