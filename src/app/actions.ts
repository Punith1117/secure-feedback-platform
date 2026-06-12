"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { eq, and, inArray, count, asc } from "drizzle-orm";
import {
  courses,
  courseOfferings,
  feedbackInstances,
  feedbackResponses,
  feedbackSubmissions,
  studentAccessCodes,
  templates,
  faculty
} from "@/lib/db/schema";
import type { Course, CourseOffering, FeedbackInstance, StudentAccessCode, FeedbackInstanceWithStats, Template, Faculty } from "@/lib/db/schema";
import { Realtime } from "ably";
import { FeedbackErrorCode, SubmitFeedbackResult } from "@/types/feedback-submit-error-types";
import { DeleteErrorCode, type DeleteResult } from "@/types/delete-error-types";

const MAX_ACCESS_CODES_PER_INSTANCE = 100;

type Rating = "good" | "average" | "bad";

interface FeedbackResponseInput {
  courseId: string;
  questionId: string;
  rating: number; // 3 = good, 2 = average, 1 = bad
}


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

    if (!instance || !instance.userId) {
      return { success: false, error: "Feedback instance not found or invalid" };
    }

    return { success: true, instance };
  } catch (error) {
    console.error("Failed to query feedback instance by join code:", error);
    return { success: false, error: "Failed to fetch feedback instance" };
  }
}

async function validateInstanceOwnership(
  instanceId: string,
  userId: string,
): Promise<{ success: true; instance: FeedbackInstance } | { success: false; error: string }> {
  try {
    const [instance] = await db
      .select()
      .from(feedbackInstances)
      .where(eq(feedbackInstances.id, instanceId))
      .limit(1);

    if (!instance || instance.userId !== userId) {
      return { success: false, error: "Feedback instance not found or access denied" };
    }

    return { success: true, instance };
  } catch (error) {
    console.error("Failed to query feedback instance ownership:", error);
    return { success: false, error: "Failed to validate feedback instance ownership" };
  }
}

export async function createFeedbackInstance(title: string, numberOfStudents: number, userId: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return { success: false, error: "Title is required" };
  }

  if (!numberOfStudents || numberOfStudents < 1) {
    return { success: false, error: "Number of students must be at least 1" };
  }

  if (numberOfStudents > MAX_ACCESS_CODES_PER_INSTANCE) {
    return { success: false, error: `Cannot generate more than ${MAX_ACCESS_CODES_PER_INSTANCE} access codes at once` };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  const joinCode = nanoid(8);

  try {
    const [instance] = await db.insert(feedbackInstances).values({
      userId: userId.trim(),
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
  courseOfferingId: string,
  userId: string,
  facultyId: string
): Promise<{ success: true; course: Course & { title: string; templateName: string; facultyName: string } } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  if (!isValidUuid(courseOfferingId)) {
    return { success: false, error: "Valid course offering ID is required" };
  }
  if (!isValidUuid(facultyId)) {
    return { success: false, error: "Valid faculty ID is required" };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId, userId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    const [course] = await db.insert(courses).values({
      instanceId,
      courseOfferingId,
      facultyId
      // createdAt, updatedAt rely on database defaults
    }).returning();

    // Fetch the title and templateName to return a complete object
    const [offering] = await db.select({
      title: courseOfferings.title,
      templateName: templates.name,
      facultyName: faculty.name
    })
      .from(courseOfferings)
      .innerJoin(templates, eq(courseOfferings.templateId, templates.id))
      .innerJoin(courses, eq(courseOfferings.id, courses.courseOfferingId))
      .innerJoin(faculty, eq(courses.facultyId, faculty.id))
      .where(eq(courseOfferings.id, courseOfferingId))
      .limit(1);

    return { success: true, course: { ...course, title: offering?.title || "Unknown", templateName: offering?.templateName || "Unknown", facultyName: offering?.facultyName || "Unknown" } };
  } catch (error) {
    console.error("Failed to create course:", error);
    return { success: false, error: "Failed to create course. This course may already exist" };
  }
}

export async function createCourseOffering(
  title: string,
  templateId: string,
  userId: string,
): Promise<{ success: true; courseOffering: CourseOffering } | { success: false; error: string }> {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return { success: false, error: "Course offering title is required" };
  }

  if (!isValidUuid(templateId)) {
    return { success: false, error: "Valid template ID is required" };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  try {
    const [courseOffering] = await db.insert(courseOfferings).values({
      userId,
      title: trimmedTitle,
      templateId,
    }).returning();

    return { success: true, courseOffering };
  } catch (error) {
    console.error("Failed to create course offering:", error);
    return { success: false, error: "Failed to create course offering. You might already have an offering with this title." };
  }
}

export async function getFaculty(
  userId: string,
): Promise<
  | { success: true; facultyList: Faculty[] }
  | { success: false; error: string }
> {
  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  try {
    const facultyList = await db
      .select()
      .from(faculty)
      .where(eq(faculty.userId, userId))
      .orderBy(asc(faculty.name));

    return { success: true, facultyList };
  } catch (error) {
    console.error("Failed to fetch faculty:", error);

    return {
      success: false,
      error: "Failed to fetch faculty",
    };
  }
}

export async function getTemplates(): Promise<{ success: true; templates: Template[] } | { success: false; error: string }> {
  try {
    const templatesResult = await db.select().from(templates);
    return { success: true, templates: templatesResult };
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return { success: false, error: "Failed to fetch templates" };
  }
}

export async function getCourseOfferings(
  userId: string,
): Promise<{ success: true; offerings: (CourseOffering & { templateName: string })[] } | { success: false; error: string }> {
  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  try {
    const offerings = await db
      .select({
        id: courseOfferings.id,
        userId: courseOfferings.userId,
        title: courseOfferings.title,
        templateId: courseOfferings.templateId,
        createdAt: courseOfferings.createdAt,
        updatedAt: courseOfferings.updatedAt,
        templateName: templates.name,
      })
      .from(courseOfferings)
      .innerJoin(templates, eq(courseOfferings.templateId, templates.id))
      .where(eq(courseOfferings.userId, userId))
      .orderBy(courseOfferings.createdAt);

    return { success: true, offerings };
  } catch (error) {
    console.error("Failed to fetch course offerings:", error);
    return { success: false, error: "Failed to fetch course offerings" };
  }
}

export async function createFaculty(
  name: string,
  userId: string,
): Promise<
  | { success: true; faculty: Faculty }
  | { success: false; error: string }
> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      error: "Faculty name is required",
    };
  }

  if (!userId?.trim()) {
    return {
      success: false,
      error: "User ID is required",
    };
  }

  try {
    const [createdFaculty] = await db
      .insert(faculty)
      .values({
        userId,
        name: trimmedName,
      })
      .returning();

    return {
      success: true,
      faculty: createdFaculty,
    };
  } catch (error: any) {
    if (error?.cause?.code === "23505") {
      return {
        success: false,
        error: "Faculty already exists",
      };
    }

    console.error(error);

    return {
      success: false,
      error: "Unexpected error",
    };
  }
}

export async function getCoursesByInstanceId(
  instanceId: string,
  userId: string,
): Promise<{ success: true; courses: (Course & { title: string; templateName: string, facultyName: string })[] } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId, userId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    const coursesResult = await db
      .select({
        id: courses.id,
        instanceId: courses.instanceId,
        courseOfferingId: courses.courseOfferingId,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        title: courseOfferings.title,
        templateName: templates.name,
        facultyId: courses.facultyId,
        facultyName: faculty.name
      })
      .from(courses)
      .innerJoin(courseOfferings, eq(courses.courseOfferingId, courseOfferings.id))
      .innerJoin(templates, eq(courseOfferings.templateId, templates.id))
      .innerJoin(faculty, eq(courses.facultyId, faculty.id))
      .where(eq(courses.instanceId, instanceId));

    return { success: true, courses: coursesResult };
  } catch (error) {
    console.error("Failed to fetch courses for instance:", error);
    return { success: false, error: "Failed to fetch courses" };
  }
}

export async function updateInstanceTitle(
  instanceId: string,
  newTitle: string,
  userId: string,
): Promise<{ success: true; instance: FeedbackInstance } | { success: false; error: string }> {
  const trimmedTitle = newTitle.trim();

  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  if (!trimmedTitle) {
    return { success: false, error: "Title is required" };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId, userId);
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

export async function getNewAccessCode(
  instanceId: string,
  userId: string
): Promise<{success: true, accessCode: StudentAccessCode} | {success: false, error: string}> {
  if (!isValidUuid(instanceId)) {
    return {
      success: false,
      error: "Valid feedback instance ID is required",
    };
  }

  if (!userId?.trim()) {
    return {
      success: false,
      error: "User ID is required",
    };
  }

  const ownership = await validateInstanceOwnership(
    instanceId,
    userId
  );

  if (!ownership.success) {
    return ownership;
  }

  try {
    const code = nanoid(8);

    const [accessCode] = await db
      .insert(studentAccessCodes)
      .values({
        instanceId,
        code,
      })
      .returning();

    return {
      success: true,
      accessCode,
    };
  } catch (error) {
    console.error("Failed to create access code:", error);

    return {
      success: false,
      error: "Failed to create access code",
    };
  }
}

export async function toggleInstanceStatus(
  instanceId: string,
  isActive: boolean,
  userId: string,
): Promise<{ success: true; instance: FeedbackInstance } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId, userId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    const [updatedInstance] = await db
      .update(feedbackInstances)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(feedbackInstances.id, instanceId))
      .returning();

    return { success: true, instance: updatedInstance };
  } catch (error) {
    console.error("Failed to toggle instance status:", error);
    return { success: false, error: "Failed to toggle instance status" };
  }
}

export async function deleteCourse(
  courseId: string,
  userId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isValidUuid(courseId)) {
    return { success: false, error: "Valid course ID is required" };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  try {
    // First, fetch the course to get its instanceId
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    // Validate ownership of the instance that owns this course
    const ownership = await validateInstanceOwnership(course.instanceId, userId);
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

export async function deleteFeedbackInstance(
  instanceId: string,
  userId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid instance ID is required" };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId, userId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    // Delete the instance (cascade will handle related records)
    await db.delete(feedbackInstances).where(eq(feedbackInstances.id, instanceId));
    return { success: true };
  } catch (error) {
    console.error("Failed to delete feedback instance:", error);
    return { success: false, error: "Failed to delete feedback instance" };
  }
}

export async function getAccessCodesByInstanceId(
  instanceId: string,
  userId: string,
): Promise<{ success: true; accessCodes: StudentAccessCode[] } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId, userId);
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

// Get all feedback instances for the current user
export async function getUserFeedbackInstances(
  userId: string,
): Promise<{ success: true; instances: FeedbackInstanceWithStats[] } | { success: false; error: string }> {
  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  try {
    // Get all instances for the user with access code counts
    const instancesWithStats = await db
      .select({
        id: feedbackInstances.id,
        userId: feedbackInstances.userId,
        joinCode: feedbackInstances.joinCode,
        title: feedbackInstances.title,
        isActive: feedbackInstances.isActive,
        createdAt: feedbackInstances.createdAt,
        updatedAt: feedbackInstances.updatedAt,
        accessCodesCount: count(studentAccessCodes.id),
      })
      .from(feedbackInstances)
      .leftJoin(studentAccessCodes, eq(feedbackInstances.id, studentAccessCodes.instanceId))
      .where(eq(feedbackInstances.userId, userId))
      .groupBy(feedbackInstances.id)
      .orderBy(feedbackInstances.createdAt);

    return { success: true, instances: instancesWithStats };
  } catch (error) {
    console.error("Failed to get user feedback instances:", error);
    return { success: false, error: "Failed to fetch feedback instances" };
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
): Promise<{ 
  success: true; 
  courses: {
    id: string;
    title: string;
    facultyName: string;
    questions: { id: string; text: string; }[];
  }[] 
} | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  try {
    const coursesData = await db.query.courses.findMany({
      where: eq(courses.instanceId, instanceId),
      with: {
        faculty: true,
        courseOffering: {
          with: {
            template: {
              with: {
                templateQuestions: {
                  with: {
                    question: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const formattedCourses = coursesData.map(c => ({
      id: c.id,
      title: c.courseOffering.title,
      facultyName: c.faculty?.name || "Unknown Faculty",
      questions: c.courseOffering.template?.templateQuestions.map(tq => ({
        id: tq.question.id,
        text: tq.question.question
      })) || []
    }));

    return { success: true, courses: formattedCourses };
  } catch (error) {
    console.error("Failed to fetch courses for student:", error);
    return { success: false, error: "Failed to fetch courses" };
  }
}

// Student feedback submission - transactional

export interface CourseFeedbackWithPercentages {
  courseId: string;
  courseTitle: string;
  facultyName: string;
  totalResponses: number;
  questions: {
    questionId: string;
    text: string;
    ratings: {
      good: number;
      average: number;
      bad: number;
    };
    percentages: {
      good: number;
      average: number;
      bad: number;
    };
  }[];
}

// Get comprehensive feedback responses for an instance
export async function getFeedbackResponsesByInstanceId(
  instanceId: string,
  userId: string,
): Promise<{ success: true; feedback: CourseFeedbackWithPercentages[] } | { success: false; error: string }> {
  if (!isValidUuid(instanceId)) {
    return { success: false, error: "Valid feedback instance ID is required" };
  }

  if (!userId?.trim()) {
    return { success: false, error: "User ID is required" };
  }

  const ownership = await validateInstanceOwnership(instanceId, userId);
  if (!ownership.success) {
    return ownership;
  }

  try {
    const coursesData = await db.query.courses.findMany({
      where: eq(courses.instanceId, instanceId),
      with: {
        faculty: true,
        courseOffering: {
          with: {
            template: {
              with: {
                templateQuestions: {
                  with: {
                    question: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (coursesData.length === 0) {
      return { success: true, feedback: [] };
    }

    const submissionsData = await db.query.feedbackSubmissions.findMany({
      where: eq(feedbackSubmissions.instanceId, instanceId)
    });

    const submissionIds = submissionsData.map((s) => s.id);

    let relevantResponses: typeof feedbackResponses.$inferSelect[] = [];
    if (submissionIds.length > 0) {
      relevantResponses = await db.query.feedbackResponses.findMany({
        where: inArray(feedbackResponses.submissionId, submissionIds)
      });
    }

    const feedback: CourseFeedbackWithPercentages[] = coursesData.map((course) => {
      const courseResponses = relevantResponses.filter(r => r.courseId === course.id);
      const totalResponses = new Set(courseResponses.map(r => r.submissionId)).size;

      const questions = course.courseOffering.template?.templateQuestions.map(tq => {
        const qResponses = courseResponses.filter(r => r.questionId === tq.question.id);
        
        const good = qResponses.filter(r => r.rating === 3).length;
        const average = qResponses.filter(r => r.rating === 2).length;
        const bad = qResponses.filter(r => r.rating === 1).length;
        const total = good + average + bad;

        return {
          questionId: tq.question.id,
          text: tq.question.question,
          ratings: { good, average, bad },
          percentages: total === 0 ? { good: 0, average: 0, bad: 0 } : {
            good: Math.round((good / total) * 100),
            average: Math.round((average / total) * 100),
            bad: Math.round((bad / total) * 100),
          }
        };
      }) || [];

      return {
        courseId: course.id,
        courseTitle: course.courseOffering.title,
        facultyName: course.faculty?.name || "Unknown Faculty",
        totalResponses,
        questions
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
): Promise<SubmitFeedbackResult> {
  // Validate joinCode
  if (!joinCode?.trim()) {
    return { success: false, error: FeedbackErrorCode.MISSING_JOIN_CODE };
  }

  // Validate accessCode
  if (!accessCode?.trim()) {
    return { success: false, error: FeedbackErrorCode.MISSING_ACCESS_CODE };
  }

  // Validate responses
  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return { success: false, error: FeedbackErrorCode.MISSING_RESPONSES };
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
    return { success: false, error: FeedbackErrorCode.INVALID_JOIN_CODE };
  }

  if (!instance) {
    return { success: false, error: FeedbackErrorCode.INVALID_JOIN_CODE };
  }

  if (!instance.isActive) {
    return { success: false, error: FeedbackErrorCode.INACTIVE_INSTANCE };
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
    return { success: false, error: FeedbackErrorCode.INVALID_ACCESS_CODE };
  }

  if (!accessCodeRecord) {
    return { success: false, error: FeedbackErrorCode.INVALID_ACCESS_CODE };
  }

  // Check if access code has already been used
  if (accessCodeRecord.used) {
    return { success: false, error: FeedbackErrorCode.ACCESS_CODE_ALREADY_USED };
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
    return { success: false, error: FeedbackErrorCode.COURSE_NOT_FOUND };
  }

  // Find valid questions for the courses (optional extra validation could be added, but we assume questionId is valid for the instance)
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];

    // Validate courseId is provided
    if (!response.courseId || !isValidUuid(response.courseId)) {
      return { success: false, error: FeedbackErrorCode.INVALID_RESPONSE, message: `Missing course ID in response ${i + 1}` };
    }

    // Validate course belongs to this instance
    if (!instanceCourseIds.has(response.courseId)) {
      return { success: false, error: FeedbackErrorCode.COURSE_NOT_FOUND, message: `Course not found in this feedback instance` };
    }

    // Validate questionId is provided
    if (!response.questionId || !isValidUuid(response.questionId)) {
      return { success: false, error: FeedbackErrorCode.INVALID_RESPONSE, message: `Missing question ID in response ${i + 1}` };
    }

    // Validate rating
    if (typeof response.rating !== "number" || response.rating < 1 || response.rating > 3) {
      return { success: false, error: FeedbackErrorCode.INVALID_RESPONSE, message: `Invalid rating value in response ${i + 1}` };
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
      const responseRecords = responses.map(response => ({
        submissionId: submission.id,
        courseId: response.courseId,
        questionId: response.questionId,
        rating: response.rating,
      }));

      await tx.insert(feedbackResponses).values(responseRecords);
    });

    // Publish to Ably after successful submission
    try {
      const ably = new Realtime(process.env.ABLY_API_KEY || "");

      // Publish feedback response
      const feedbackChannel = ably.channels.get(`feedback:${joinCode}`);
      await feedbackChannel.publish("feedback-response", {
        joinCode,
        responses,
        timestamp: new Date().toISOString(),
      });

      // Publish access code usage update
      const accessCodeChannel = ably.channels.get(`access-codes:${joinCode}`);
      await accessCodeChannel.publish("access-code-used", {
        accessCodeId: accessCodeRecord.id,
        code: accessCodeRecord.code,
        instanceId: instance.id,
        timestamp: new Date().toISOString(),
      });

      ably.close();
    } catch (ablyError) {
      console.error("Failed to publish to Ably:", ablyError);
      // Don't fail the submission if Ably publishing fails
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { success: false, error: FeedbackErrorCode.INTERNAL_ERROR, message: "Failed to submit feedback" };
  }
}

export async function deleteFaculty(
  facultyId: string,
  userId: string
): Promise<DeleteResult> {
  try {
    if (!facultyId?.trim()) {
      return {
        success: false,
        error: DeleteErrorCode.NOT_FOUND,
        message: "Faculty id is required",
      };
    }

    if (!isValidUuid(facultyId)) {
      return {
        success: false,
        error: DeleteErrorCode.NOT_FOUND,
        message: "Invalid faculty id",
      };
    }
    // Ensure faculty belongs to user (security boundary)
    const existing = await db.query.faculty.findFirst({
      where: (f, { eq, and }) =>
        and(eq(f.id, facultyId), eq(f.userId, userId)),
    });

    if (!existing) {
      return {
        success: false,
        error: DeleteErrorCode.NOT_FOUND,
      };
    }

    try {
      await db.delete(faculty).where(eq(faculty.id, facultyId));

      return { success: true };
    } catch (err: any) {
      // PostgreSQL foreign key violation (RESTRICT)
      if (err?.cause?.code === "23503") {
        return {
          success: false,
          error: DeleteErrorCode.HAS_DEPENDENCIES,
          message: "Faculty is linked to courses. Remove the links first.",
        };
      }

      throw err;
    }
  } catch (err) {
    console.error("deleteFaculty error:", err);

    return {
      success: false,
      error: DeleteErrorCode.INTERNAL_ERROR,
    };
  }
}

export async function deleteCourseOffering(
  courseOfferingId: string,
  userId: string
): Promise<DeleteResult> {
  try {
    if (!courseOfferingId?.trim()) {
      return {
        success: false,
        error: DeleteErrorCode.NOT_FOUND,
        message: "Course offering id is required",
      };
    }

    // ownership check
    const existing = await db.query.courseOfferings.findFirst({
      where: (c, { eq, and }) =>
        and(eq(c.id, courseOfferingId), eq(c.userId, userId)),
    });

    if (!existing) {
      return {
        success: false,
        error: DeleteErrorCode.NOT_FOUND,
      };
    }

    try {
      await db
        .delete(courseOfferings)
        .where(eq(courseOfferings.id, courseOfferingId));

      return { success: true };
    } catch (err: any) {
      // FK restriction (courses table references course_offerings)
      if (err?.cause?.code === "23503") {
        console.log("here")
        console.log("here")
        return {
          success: false,
          error: DeleteErrorCode.HAS_DEPENDENCIES,
          message: "Course offering is used in active feedback instances. Remove the courses first.",
        };
      }

      throw err;
    }
  } catch (err) {
    console.error("deleteCourseOffering error:", err);

    return {
      success: false,
      error: DeleteErrorCode.INTERNAL_ERROR,
    };
  }
}