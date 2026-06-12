import { describe, it, expect } from "vitest";
import { sql } from "drizzle-orm";

import {
  createCourseOffering,
  getCourseOfferings,
  deleteCourseOffering,
} from "@/app/actions";

import { seedUsers } from "../fixtures/user.fixture";
import { createCourseOfferingFixture } from "../fixtures/builders/course-offering.builder";
import { seedBaseData } from "../fixtures/builders/db-seeder";
import { randomUUID } from "crypto";
import { createFeedbackInstanceFixture } from "../fixtures/builders/feedback-instance.builder";
import { faculty } from "@/lib/db/schema";
import { createFacultyFixture } from "../fixtures/builders/faculty.builder";
import { createCourseFixture } from "../fixtures/builders/course.builder";
import { DeleteErrorCode } from "@/types/delete-error-types";

describe("create course offering", () => {
  it("should create a course offering successfully", async () => {
    let seed = await seedBaseData();

    const res = await createCourseOffering(
      "DBMS",
      seed.templateId,
      "user_admin_a"
    );

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.courseOffering.title).toBe("DBMS");
      expect(res.courseOffering.userId).toBe("user_admin_a");
      expect(res.courseOffering.templateId).toBe(seed.templateId);
    }
  });

  it("should fail when title is empty", async () => {
    let seed = await seedBaseData();

    const res = await createCourseOffering(
      "   ",
      seed.templateId,
      "user_admin_a"
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toMatch(/required/i);
    }
  });

  it("should fail with invalid template id", async () => {
    const res = await createCourseOffering(
      "DBMS",
      "invalid-template",
      "user_admin_a"
    );

    expect(res.success).toBe(false);
  });

  it("should fail when userId is missing", async () => {
    let seed = await seedBaseData();

    const res = await createCourseOffering(
      "DBMS",
      seed.templateId,
      ""
    );

    expect(res.success).toBe(false);
  });
});

describe("get course offerings", async () => {	
	it("should return offerings for a user", async () => {
		let seed = await seedBaseData();

    await createCourseOfferingFixture({
      userId: "user_admin_a",
      title: "DBMS",
      templateId: seed.templateId,
    });

    await createCourseOfferingFixture({
      userId: "user_admin_a",
      title: "OS",
      templateId: seed.templateId,
    });

    const res = await getCourseOfferings("user_admin_a");

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.offerings.length).toBe(2);
      expect(res.offerings[0]).toHaveProperty("templateName");
    }
  });

  it("should return empty array for user with no offerings", async () => {
    const res = await getCourseOfferings("user_admin_b");

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.offerings).toEqual([]);
    }
  });

  it("should fail when userId is empty", async () => {
    const res = await getCourseOfferings("   ");

    expect(res.success).toBe(false);
  });
});

describe("delete course offering", () => {
  it("should delete a course offering successfully", async () => {
		let seed = await seedBaseData();

    const offering = await createCourseOfferingFixture({
      userId: "user_admin_a",
      templateId: seed.templateId,
    });

    const res = await deleteCourseOffering(
      offering.id,
      "user_admin_a"
    );

    expect(res.success).toBe(true);

    const check = await getCourseOfferings("user_admin_a");

    if (check.success) {
      expect(check.offerings.length).toBe(0);
    }
  });

	it("should fail when course offering is used in a course inside a feedback instance", async () => {
		const seed = await seedBaseData();

		const instance = await createFeedbackInstanceFixture({
			userId: "user_admin_a",
		});

		const offering = await createCourseOfferingFixture({
			userId: "user_admin_a",
			templateId: seed.templateId,
		});

		const facultyMember = await createFacultyFixture({
			userId: "user_admin_a",
			name: "Dr. Dependency Test",
		});

		await createCourseFixture({
			instanceId: instance.id,
			courseOfferingId: offering.id,
			facultyId: facultyMember.id,
		});

		const res = await deleteCourseOffering(
			offering.id,
			"user_admin_a"
		);

		expect(res.success).toBe(false);

		if (!res.success) {
			expect(res.error).toBe(DeleteErrorCode.HAS_DEPENDENCIES);
			expect(res.message).toMatch(/course|feedback|instance/i);
		}
	});

  it("should fail when deleting non-existent offering", async () => {
    const res = await deleteCourseOffering( // no course offering has been inserted previously
      randomUUID(),
      "user_admin_a"
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("NOT_FOUND");
    }
  });

  it("should fail when user does not own the offering", async () => {
		let seed = await seedBaseData();

    const offering = await createCourseOfferingFixture({
      userId: "user_admin_a",
      templateId: seed.templateId,
    });

    const res = await deleteCourseOffering(
      offering.id,
      "user_admin_b"
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("NOT_FOUND");
    }
  });
});