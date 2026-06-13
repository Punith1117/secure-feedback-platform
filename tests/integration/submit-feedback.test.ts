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
  getFeedbackInstanceForStudent,
  getCoursesByInstanceIdForStudent,
  submitFeedback,
} from "@/app/actions";

import { db } from "@/lib/db";
import { studentAccessCodes } from "@/lib/db/schema";
import { FeedbackErrorCode } from "@/types/feedback-submit-error-types";
import { eq } from "drizzle-orm";

describe("get feedback instance for student", () => {
	it("should return error for empty join code", async () => {
		await seedBaseData();
		const res = await getFeedbackInstanceForStudent("");

		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error).toBe("Join code is required");
		}
	});

	it("should return error for invalid join code", async () => {
		await seedBaseData();
		const res = await getFeedbackInstanceForStudent("INVALID");

		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error).toBe("Feedback instance not found");
		}
	});

	it("should return feedback instance for valid join code", async () => {
		await seedBaseData();

		const instance = await createFeedbackInstanceFixture({
			userId: "user_admin_a",
		});

		const res = await getFeedbackInstanceForStudent(instance.joinCode);

		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.instance.id).toBe(instance.id);
			expect(res.instance.joinCode).toBe(instance.joinCode);
		}
	});
});

describe("get courses by instance id for student", () => {
	it("should reject invalid UUID", async () => {
		await seedBaseData();
		const res = await getCoursesByInstanceIdForStudent("invalid-id");

		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error).toMatch(/valid/i);
		}
	});

	it("should return courses with faculty and questions", async () => {
		let seed = await seedBaseData();
		const instance = await createFeedbackInstanceFixture({
			userId: "user_admin_a",
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

		const res = await getCoursesByInstanceIdForStudent(instance.id);

		expect(res.success).toBe(true);

		if (res.success) {
			expect(res.courses.length).toBeGreaterThan(0);

			const c = res.courses[0];
			expect(c.id).toBe(course.id);
			expect(c.facultyName).toBe(faculty.name);
			expect(c.questions.length).toBeGreaterThan(0);
		}
	});
});

describe("submit feedback", async () => {
	it("should fail when join code is missing", async () => {
		await seedBaseData();
		const res = await submitFeedback("", "ACCESS", []);

		expect(res.success).toBe(false);
	});

	it("should fail when access code is missing", async () => {
		await seedBaseData();
		const res = await submitFeedback("JOIN", "", []);

		expect(res.success).toBe(false);
	});

	it("should fail when responses are empty", async () => {
		await seedBaseData();
		const res = await submitFeedback("JOIN", "ACCESS", []);

		expect(res.success).toBe(false);
	});

	it("should submit feedback successfully", async () => {
		const seed = await seedBaseData();

		const instance = await createFeedbackInstanceFixture({
			userId: "user_admin_a",
			isActive: true,
			accessCodes: {
				codes: ["TEST123"],
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

		const res = await submitFeedback(
			instance.joinCode,
			"TEST123",
			[
				{
					courseId: course.id,
					questionId: seed.q1,
					rating: 1,
				},
			],
		);

		expect(res.success).toBe(true);
	});

	it("should reject reused access code", async () => {
		await seedBaseData();

		const instance = await createFeedbackInstanceFixture({
			userId: "user_admin_a",
			isActive: true,
			accessCodes: {
				codes: ["USED123"],
			},
		});

		// mark it as used (since fixture only creates unused codes)
		await db
			.update(studentAccessCodes)
			.set({ used: true })
			.where(eq(studentAccessCodes.code, "USED123"));

		const res = await submitFeedback(instance.joinCode, "USED123", [
			{
				courseId: "fake",
				questionId: "fake",
				rating: 1,
			},
		]);

		expect(res.success).toBe(false);

		if (!res.success) {
			expect(res.error).toBe(FeedbackErrorCode.ACCESS_CODE_ALREADY_USED);
		}
	});

	it("should reject invalid rating (less than 1 or greater than 3)", async () => {
		const seed = await seedBaseData();

		const instance = await createFeedbackInstanceFixture({
			userId: "user_admin_a",
			isActive: true,
			accessCodes: {
				codes: ["VALID123"],
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

		const res = await submitFeedback(instance.joinCode, "VALID123", [
			{
				courseId: course.id, 
				questionId: seed.q1, 
				rating: 999,  
			},
		]);

		expect(res.success).toBe(false);

		if (!res.success) {
			expect(res.error).toBe(FeedbackErrorCode.INVALID_RESPONSE);
			expect(res.message).toContain("Invalid rating value");
		}
	});
});
