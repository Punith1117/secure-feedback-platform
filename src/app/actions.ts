"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { eq, and, inArray } from "drizzle-orm";
import {
  courses,
  feedbackInstances,
  feedbackResponses,
  feedbackSubmissions,
  studentAccessCodes,
} from "@/lib/db/schema";
import type { Course, FeedbackInstance, StudentAccessCode } from "@/lib/db/schema";

type Rating = "good" | "average" | "bad";
type QuestionType = "lecture_quality" | "course_content";

interface FeedbackResponseInput {
  courseId: string;
  lectureQualityRating: Rating;
  courseContentRating: Rating;
}

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

export async function updateInstanceTitle(
  instanceId: string,
  newTitle: string,
): Promise<{ success: true; instance: FeedbackInstance } | { success: false; error: string }> {
  const trimmedTitle = newTitle.trim();

  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  if (!trimmedTitle) {
    return { success: false, error: "Title is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    const [updatedInstance] = await db
      .update(feedbackInstances)
      .set({ title: trimmedTitle, updatedAt: new Date() })
      .where(eq(feedbackInstances.id, instanceId))
      .returning();

    return { success: true, instance: updatedInstance };
  } catch (error) {
    console.error("Failed to update instance title:", error);
    return { success: false, error: "Failed to update instance title" };
  }
}

export async function deleteCourse(
  courseId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isValidUuid(courseId)) {
    return { success: false, error: "Valid course ID is required" };
  }

  try {
    // First, fetch the course to get its instanceId
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Validate ownership of the instance that owns this course
    const ownership = await validateInstanceOwnership(course.instanceId);
    if (!ownership.success) {
      return ownership;
    }

    // Delete the course
    await db.delete(courses).where(eq(courses.id, courseId));

    return { success: true };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { success: false, error: "Failed to delete course" };
  }
}

export async function getAccessCodesByInstanceId(
  instanceId: string,
): Promise<{ success: true; accessCodes: StudentAccessCode[] } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    const accessCodesResult = await db
      .select()
      .from(studentAccessCodes)
      .where(eq(studentAccessCodes.instanceId, instanceId));

    return { success: true, accessCodes: accessCodesResult };
  } catch (error) {
    console.error("Failed to fetch access codes for instance:", error);
    return { success: false, error: "Failed to fetch access codes" };
  }
}

// Student-safe actions (no admin ownership validation)

export async function getFeedbackInstanceForStudent(
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

    if (!instance) {
      return { success: false, error: "Feedback instance not found" };
    }

    return { success: true, instance };
  } catch (error) {
    console.error("Failed to query feedback instance for student:", error);
    return { success: false, error: "Failed to fetch feedback instance" };
  }
}

export async function getCoursesByInstanceIdForStudent(
  instanceId: string,
): Promise<{ success: true; courses: Course[] } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  try {
    const coursesResult = await db.select().from(courses).where(eq(courses.instanceId, instanceId));
    return { success: true, courses: coursesResult };
  } catch (error) {
    console.error("Failed to fetch courses for student:", error);
    return { success: false, error: "Failed to fetch courses" };
  }
}

// Student feedback submission - transactional

interface CourseFeedbackStats {
  courseId: string;
  courseTitle: string;
  totalResponses: number;
  lectureQualityRatings: {
    good: number;
    average: number;
    bad: number;
  };
  courseContentRatings: {
    good: number;
    average: number;
    bad: number;
  };
}

interface CourseFeedbackWithPercentages extends CourseFeedbackStats {
  lectureQualityPercentages: {
    good: number;
    average: number;
    bad: number;
  };
  courseContentPercentages: {
    good: number;
    average: number;
    bad: number;
  };
}

// Get comprehensive feedback responses for an instance
export async function getFeedbackResponsesByInstanceId(
  instanceId: string,
): Promise<{ success: true; feedback: CourseFeedbackWithPercentages[] } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    // Get all courses for this instance
    const coursesData = await db.select().from(courses).where(eq(courses.instanceId, instanceId));

    if (coursesData.length === 0) {
      return { success: true, feedback: [] };
    }

    // Get all submissions for this instance
    const submissionsData = await db
      .select()
      .from(feedbackSubmissions)
      .where(eq(feedbackSubmissions.instanceId, instanceId));

    const submissionIds = new Set(submissionsData.map((s) => s.id));

    if (submissionIds.size === 0) {
      // No submissions yet, return courses with zero counts
      const emptyFeedback: CourseFeedbackWithPercentages[] = coursesData.map((course) => ({
        courseId: course.id,
        courseTitle: course.title,
        totalResponses: 0,
        lectureQualityRatings: { good: 0, average: 0, bad: 0 },
        courseContentRatings: { good: 0, average: 0, bad: 0 },
        lectureQualityPercentages: { good: 0, average: 0, bad: 0 },
        courseContentPercentages: { good: 0, average: 0, bad: 0 },
      }));
      return { success: true, feedback: emptyFeedback };
    }

    // Get all responses for these submissions using efficient database filtering
    const relevantResponses = await db
      .select()
      .from(feedbackResponses)
      .where(inArray(feedbackResponses.submissionId, Array.from(submissionIds)));

    // Build a map of courseId -> responses
    const responsesByCourse: Map<string, { lectureQuality: Rating[]; courseContent: Rating[] }> = new Map();

    for (const course of coursesData) {
      responsesByCourse.set(course.id, { lectureQuality: [], courseContent: [] });
    }

    for (const response of relevantResponses) {
      const courseResponses = responsesByCourse.get(response.courseId);
      if (courseResponses) {
        if (response.questionType === "lecture_quality") {
          courseResponses.lectureQuality.push(response.rating as Rating);
        } else if (response.questionType === "course_content") {
          courseResponses.courseContent.push(response.rating as Rating);
        }
      }
    }

    // Calculate stats for each course
    const feedback: CourseFeedbackWithPercentages[] = coursesData.map((course) => {
      const courseResponses = responsesByCourse.get(course.id) || {
        lectureQuality: [],
        courseContent: [],
      };

      const lectureQualityCounts = {
        good: courseResponses.lectureQuality.filter((r) => r === "good").length,
        average: courseResponses.lectureQuality.filter((r) => r === "average").length,
        bad: courseResponses.lectureQuality.filter((r) => r === "bad").length,
      };

      const courseContentCounts = {
        good: courseResponses.courseContent.filter((r) => r === "good").length,
        average: courseResponses.courseContent.filter((r) => r === "average").length,
        bad: courseResponses.courseContent.filter((r) => r === "bad").length,
      };

      const totalResponses = Math.max(
        lectureQualityCounts.good + lectureQualityCounts.average + lectureQualityCounts.bad,
        courseContentCounts.good + courseContentCounts.average + courseContentCounts.bad
      );

      const calculatePercentages = (counts: typeof lectureQualityCounts) => {
        const total = counts.good + counts.average + counts.bad;
        if (total === 0) return { good: 0, average: 0, bad: 0 };
        return {
          good: Math.round((counts.good / total) * 100),
          average: Math.round((counts.average / total) * 100),
          bad: Math.round((counts.bad / total) * 100),
        };
      };

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalResponses,
        lectureQualityRatings: lectureQualityCounts,
        courseContentRatings: courseContentCounts,
        lectureQualityPercentages: calculatePercentages(lectureQualityCounts),
        courseContentPercentages: calculatePercentages(courseContentCounts),
      };
    });

    return { success: true, feedback };
  } catch (error) {
    console.error("Failed to fetch feedback responses for instance:", error);
    return { success: false, error: "Failed to fetch feedback responses" };
  }
}

export async function submitFeedback(
  joinCode: string,
  accessCode: string,
  responses: FeedbackResponseInput[],
): Promise<{ success: true } | { success: false; error: string }> {
  // Validate joinCode
  if (!joinCode?.trim()) {
    return { success: false, error: "Join code is required" };
  }

  // Validate accessCode
  if (!accessCode?.trim()) {
    return { success: false, error: "Access code is required" };
  }

  // Validate responses
  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return { success: false, error: "At least one response is required" };
  }

  // Valid rating values
  const validRatings: Rating[] = ["good", "average", "bad"];

  // Find the feedback instance
  let instance: FeedbackInstance | undefined;
  try {
    const [foundInstance] = await db
      .select()
      .from(feedbackInstances)
      .where(eq(feedbackInstances.joinCode, joinCode.trim()))
      .limit(1);
    instance = foundInstance;
  } catch (error) {
    console.error("Failed to query feedback instance:", error);
    return { success: false, error: "Feedback instance not found" };
  }

  if (!instance) {
    return { success: false, error: "Feedback instance not found" };
  }

  // Find the access code for this instance
  let accessCodeRecord: StudentAccessCode | undefined;
  try {
    const [foundAccessCode] = await db
      .select()
      .from(studentAccessCodes)
      .where(
        and(
          eq(studentAccessCodes.instanceId, instance.id),
          eq(studentAccessCodes.code, accessCode.trim())
        )
      )
      .limit(1);
    accessCodeRecord = foundAccessCode;
  } catch (error) {
    console.error("Failed to query access code:", error);
    return { success: false, error: "Invalid access code for this feedback instance" };
  }

  if (!accessCodeRecord) {
    return { success: false, error: "Invalid access code for this feedback instance" };
  }

  // Check if access code has already been used
  if (accessCodeRecord.used) {
    return { success: false, error: "This access code has already been used" };
  }

  // Validate each response
  const instanceCourseIds = new Set<string>();
  try {
    const instanceCourses = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.instanceId, instance.id));
    instanceCourseIds.clear();
    instanceCourses.forEach((c) => instanceCourseIds.add(c.id));
  } catch (error) {
    console.error("Failed to fetch instance courses:", error);
    return { success: false, error: "Failed to fetch courses for validation" };
  }

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];

    // Validate courseId is provided
    if (!response.courseId || !isValidUuid(response.courseId)) {
      return { success: false, error: `Missing course ID in response ${i + 1}` };
    }

    // Validate course belongs to this instance
    if (!instanceCourseIds.has(response.courseId)) {
      return { success: false, error: `Course not found in this feedback instance` };
    }

    // Validate lectureQualityRating
    if (!response.lectureQualityRating) {
      return { success: false, error: `Missing lecture quality rating in response ${i + 1}` };
    }
    if (!validRatings.includes(response.lectureQualityRating)) {
      return { success: false, error: `Invalid lecture quality rating value in response ${i + 1}` };
    }

    // Validate courseContentRating
    if (!response.courseContentRating) {
      return { success: false, error: `Missing course content rating in response ${i + 1}` };
    }
    if (!validRatings.includes(response.courseContentRating)) {
      return { success: false, error: `Invalid course content rating value in response ${i + 1}` };
    }
  }

  // All validations passed - perform transactional DB operations
  try {
    await db.transaction(async (tx) => {
      // Step 1: Mark access code as used
      await tx
        .update(studentAccessCodes)
        .set({ used: true, usedAt: new Date() })
        .where(eq(studentAccessCodes.id, accessCodeRecord!.id));

      // Step 2: Insert feedback submission record
      const [submission] = await tx
        .insert(feedbackSubmissions)
        .values({
          instanceId: instance!.id,
          accessCodeId: accessCodeRecord!.id,
        })
        .returning();

      // Step 3: Insert all feedback responses
      const responseRecords = [];
      for (const response of responses) {
        // Lecture quality response
        responseRecords.push({
          submissionId: submission.id,
          courseId: response.courseId,
          questionType: "lecture_quality" as QuestionType,
          rating: response.lectureQualityRating,
        });
        // Course content response
        responseRecords.push({
          submissionId: submission.id,
          courseId: response.courseId,
          questionType: "course_content" as QuestionType,
          rating: response.courseContentRating,
        });
      }

      await tx.insert(feedbackResponses).values(responseRecords);
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}
