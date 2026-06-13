import { describe, it, expect } from "vitest";
import { vi } from "vitest";

vi.mock("ably", () => {
  return {
    Realtime: class {
      channels = {
        get: () => ({
          publish: vi.fn().mockResolvedValue(undefined),
        }),
      };

      close = vi.fn();
    },
  };
});

import { seedBaseData } from "../fixtures/builders/db-seeder";

import { createFeedbackInstanceFixture } from "../fixtures/builders/feedback-instance.builder";
import { createCourseOfferingFixture } from "../fixtures/builders/course-offering.builder";
import { createCourseFixture } from "../fixtures/builders/course.builder";
import { createFacultyFixture } from "../fixtures/builders/faculty.builder";

import {
  createFeedbackInstance,
  updateInstanceTitle,
  toggleInstanceStatus,
  getUserFeedbackInstances,
  getFeedbackResponsesByInstanceId,
  deleteFeedbackInstance,
  getInstanceByJoinCode,
} from "@/app/actions";

import { db } from "@/lib/db";
import { studentAccessCodes, feedbackResponses, feedbackSubmissions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

describe("get instance by join code", () => {
  it("should fail for empty join code", async () => {
    const res = await getInstanceByJoinCode("");
    expect(res.success).toBe(false);
  });

  it("should return instance for valid join code", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const res = await getInstanceByJoinCode(instance.joinCode);

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.instance.id).toBe(instance.id);
    }
  });
});

describe("create feedback instance", () => {
  it("should fail on invalid inputs", async () => {
    const res = await createFeedbackInstance("", 0, "");
    expect(res.success).toBe(false);
  });

  it("should create instance successfully", async () => {
    await seedBaseData();

    const res = await createFeedbackInstance("Test Instance", 5, "user_admin_a");

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.joinCode).toBeDefined();
    }
  });
});

describe("update instance title", () => {
  it("should update instance title", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const res = await updateInstanceTitle(
      instance.id,
      "Updated Title",
      "user_admin_a",
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.instance.title).toBe("Updated Title");
    }
  });
});

describe("toggle instance status", () => {
  it("should toggle instance active status", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
      isActive: true,
    });

    const res = await toggleInstanceStatus(
      instance.id,
      false,
      "user_admin_a",
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.instance.isActive).toBe(false);
    }
  });
});

describe("get user feedback instances", () => {
  it("should return user instances with stats", async () => {
    await seedBaseData();

    // add first instance
    await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });
    
    // add second instance
    await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const res = await getUserFeedbackInstances("user_admin_a");

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.instances).toHaveLength(2);
      expect(res.instances[0]).toHaveProperty("accessCodesCount");
    }
  });
});

describe("get feedback responses by instance id", () => {
  it("should return empty feedback if no responses exist", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const res = await getFeedbackResponsesByInstanceId(
      instance.id,
      "user_admin_a",
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.feedback.length).toBe(0);
    }
  });

  it("should return aggregated feedback data", async () => {
    const seed = await seedBaseData();
    const accessCode = "AGG123"

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
      isActive: true,
      accessCodes: {
        codes: [accessCode],
      },
    });

    const faculty = await createFacultyFixture({
      userId: "user_admin_a",
    });

    const offering = await createCourseOfferingFixture({
      userId: "user_admin_a",
      templateId: seed.templateId,
    });

    const course = await createCourseFixture({
      instanceId: instance.id,
      facultyId: faculty.id,
      courseOfferingId: offering.id,
    });

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
    
    expect(foundAccessCode).toBeDefined();

    const submission = await db
      .insert(feedbackSubmissions)
      .values({
        instanceId: instance.id,
        accessCodeId: foundAccessCode.id,
      })
      .returning();

    const submissionId = submission[0].id;

    await db.insert(feedbackResponses).values({
      submissionId,
      courseId: course.id,
      questionId: seed.q1,
      rating: 3,
    });

    const res = await getFeedbackResponsesByInstanceId(
      instance.id,
      "user_admin_a",
    );

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.feedback).toHaveLength(1);
      expect(res.feedback[0].totalResponses).toBe(1);
      expect(res.feedback[0].questions[0].ratings.good).toBe(1);
      expect(res.feedback[0].questions[0].percentages.good).toBe(100);
      expect(res.feedback[0].courseId).toBe(course.id);
    }
  });
});

describe("delete feedback instance", () => {
  it("should delete instance successfully", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const res = await deleteFeedbackInstance(
      instance.id,
      "user_admin_a",
    );

    expect(res.success).toBe(true);
  });

  it("should fail for invalid instance id", async () => {
    const res = await deleteFeedbackInstance(
      randomUUID(),
      "user_admin_a",
    );

    expect(res.success).toBe(false);
  });
});