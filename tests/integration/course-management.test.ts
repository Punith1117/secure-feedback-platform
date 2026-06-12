import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

import { testUsers } from "../fixtures/user.fixture";
import { createFeedbackInstanceFixture } from "../fixtures/builders/feedback-instance.builder";
import { createFacultyFixture } from "../fixtures/builders/faculty.builder";
import { createCourseOfferingFixture } from "../fixtures/builders/course-offering.builder";
import { createCourseFixture } from "../fixtures/builders/course.builder";

import {
  createCourse,
  deleteCourse,
  getCoursesByInstanceId,
} from "@/app/actions";

import { courses } from "@/lib/db/schema";
import { seedBaseData } from "../fixtures/builders/db-seeder";

describe("create course", () => {
	it("should create a course successfully", async () => {
		const seed = await seedBaseData()

		const instance = await createFeedbackInstanceFixture({
			userId: testUsers.adminA.id,
		});

		const faculty = await createFacultyFixture({
			userId: testUsers.adminA.id,
		});

		const offering = await createCourseOfferingFixture({
			userId: testUsers.adminA.id,
			templateId: seed.templateId
		});

		const result = await createCourse(
			instance.id,
			offering.id,
			testUsers.adminA.id,
			faculty.id
		);

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.course.instanceId).toBe(instance.id);
			expect(result.course.courseOfferingId).toBe(offering.id);
			expect(result.course.facultyId).toBe(faculty.id);
			expect(result.course.title).toBeDefined();
			expect(result.course.templateName).toBeDefined();
			expect(result.course.facultyName).toBeDefined();
		}

		// verify DB persistence
		const [dbCourse] = await db
			.select()
			.from(courses)
			.where(eq(courses.id, result.success ? result.course.id : ""));

		expect(dbCourse).toBeDefined();
	});

	it("should prevent unauthorized creation", async () => {
		const seed = await seedBaseData()

		const instance = await createFeedbackInstanceFixture({
			userId: testUsers.adminA.id,
		});

		const faculty = await createFacultyFixture({
			userId: testUsers.adminA.id,
		});

		const offering = await createCourseOfferingFixture({
			userId: testUsers.adminA.id,
			templateId: seed.templateId
		});

		// adminB tries to create course in adminA's instance
		const result = await createCourse(
			instance.id,
			offering.id,
			testUsers.adminB.id,
			faculty.id
		);

		expect(result.success).toBe(false);

		if (!result.success) {
			expect(result.error).toBeDefined();
		}
	});
});


describe("get course by instance id", () => {
	it("should fetch courses by instanceId", async () => {
		const seed = await seedBaseData()

		const instance = await createFeedbackInstanceFixture({
			userId: testUsers.adminA.id,
		});

		const faculty = await createFacultyFixture({
			userId: testUsers.adminA.id,
		});

		const offering = await createCourseOfferingFixture({
			userId: testUsers.adminA.id,
			templateId: seed.templateId
		});

		const course = await createCourseFixture({
			instanceId: instance.id,
			courseOfferingId: offering.id,
			facultyId: faculty.id,
		});

		const result = await getCoursesByInstanceId(
			instance.id,
			testUsers.adminA.id
		);

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.courses.length).toBe(1);
			expect(result.courses[0].id).toBe(course.id);
			expect(result.courses[0].title).toBeDefined();
			expect(result.courses[0].templateName).toBeDefined();
			expect(result.courses[0].facultyName).toBeDefined();
		}
	});
});


describe("delete course", () => {
	it("should delete a course successfully", async () => {
		const seed = await seedBaseData()

		const instance = await createFeedbackInstanceFixture({
			userId: testUsers.adminA.id,
		});

		const faculty = await createFacultyFixture({
			userId: testUsers.adminA.id,
		});

		const offering = await createCourseOfferingFixture({
			userId: testUsers.adminA.id,
			templateId: seed.templateId
		});

		const course = await createCourseFixture({
			instanceId: instance.id,
			courseOfferingId: offering.id,
			facultyId: faculty.id,
		});

		const deleteResult = await deleteCourse(
			course.id,
			testUsers.adminA.id
		);

		expect(deleteResult.success).toBe(true);

		const [dbCourse] = await db
			.select()
			.from(courses)
			.where(eq(courses.id, course.id));

		expect(dbCourse).toBeUndefined();
	});

	it("should prevent unauthorized deletion", async () => {
		const seed = await seedBaseData()

		const instanceA = await createFeedbackInstanceFixture({
			userId: testUsers.adminA.id,
		});

		const faculty = await createFacultyFixture({
			userId: testUsers.adminA.id,
		});

		const offering = await createCourseOfferingFixture({
			userId: testUsers.adminA.id,
			templateId: seed.templateId
		});

		const course = await createCourseFixture({
			instanceId: instanceA.id,
			courseOfferingId: offering.id,
			facultyId: faculty.id,
		});

		const result = await deleteCourse(
			course.id,
			testUsers.adminB.id
		);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeDefined();
		}
	});
});