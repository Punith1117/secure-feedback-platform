"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { courses, feedbackInstances, studentAccessCodes } from "@/lib/db/schema";
import type { Course, FeedbackInstance } from "@/lib/db/schema";

const ADMIN_ID = "1ca9a886-5192-47e6-9a10-0f356dac14dc";

const isValidUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export async function getInstanceByJoinCode(
  joinCode: string,
): Promise<{ success: true; instance: FeedbackInstance } | { success: false; error: string }> {
  if (!joinCode?.trim()) {
    return { success: false, error: "Join code is required" };
  }

  try {
    const [instance] = await db
      .select()
      .from(feedbackInstances)
      .where(eq(feedbackInstances.joinCode, joinCode.trim()))
      .limit(1);

    if (!instance || instance.adminId !== ADMIN_ID) {
      return { success: false, error: "Feedback instance not found or not owned by admin" };
    }

    return { success: true, instance };
  } catch (error) {
    console.error("Failed to query feedback instance by join code:", error);
    return { success: false, error: "Failed to fetch feedback instance" };
  }
}

async function validateInstanceOwnership(
  instanceId: string,
): Promise<{ success: true; instance: FeedbackInstance } | { success: false; error: string }> {
  try {
    const [instance] = await db
      .select()
      .from(feedbackInstances)
      .where(eq(feedbackInstances.id, instanceId))
      .limit(1);

    if (!instance || instance.adminId !== ADMIN_ID) {
      return { success: false, error: "Feedback instance not found or not owned by admin" };
    }

    return { success: true, instance };
  } catch (error) {
    console.error("Failed to query feedback instance ownership:", error);
    return { success: false, error: "Failed to validate feedback instance ownership" };
  }
}

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
      adminId: ADMIN_ID,
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

export async function createCourse(
  instanceId: string,
  title: string,
): Promise<{ success: true; course: Course } | { success: false; error: string }> {
  const trimmedTitle = title.trim();

  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  if (!trimmedTitle) {
    return { success: false, error: "Course title is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    const [course] = await db.insert(courses).values({
      instanceId,
      title: trimmedTitle,
      // createdAt, updatedAt rely on database defaults
    }).returning();

    return { success: true, course };
  } catch (error) {
    console.error("Failed to create course:", error);
    return { success: false, error: "Failed to create course" };
  }
}

export async function getCoursesByInstanceId(
  instanceId: string,
): Promise<{ success: true; courses: Course[] } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    const coursesResult = await db.select().from(courses).where(eq(courses.instanceId, instanceId));
    return { success: true, courses: coursesResult };
  } catch (error) {
    console.error("Failed to fetch courses for instance:", error);
    return { success: false, error: "Failed to fetch courses" };
  }
}
