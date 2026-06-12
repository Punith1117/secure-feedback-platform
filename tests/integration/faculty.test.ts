import { describe, it, expect } from "vitest";

import {
  createFaculty,
  getFaculty,
  deleteFaculty,
} from "@/app/actions";

import { createFacultyFixture } from "../fixtures/builders/faculty.builder";

import { userFixtures } from "../fixtures/base/user.fixtures";
import { createCourseOfferingFixture } from "../fixtures/builders/course-offering.builder";
import { createFeedbackInstanceFixture } from "../fixtures/builders/feedback-instance.builder";
import { createCourseFixture } from "../fixtures/builders/course.builder";
import { DeleteErrorCode } from "@/types/delete-error-types";
import { seedBaseData } from "../fixtures/builders/db-seeder";

describe("create faculty", () => {
  it("should create faculty successfully", async () => {
    const result = await createFaculty(
      "Dr. Smith",
      userFixtures.adminA.id
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.faculty.name).toBe("Dr. Smith");
      expect(result.faculty.userId).toBe(userFixtures.adminA.id);
    }
  });

  it("should fail when faculty name is empty", async () => {
    const result = await createFaculty(
      "   ",
      userFixtures.adminA.id
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error).toBe("Faculty name is required");
    }
  });

  it("should handle duplicate faculty names per user", async () => {
    await createFaculty("Dr. Smith", userFixtures.adminA.id);

    const result = await createFaculty(
      "Dr. Smith",
      userFixtures.adminA.id
    );

    expect(result.success).toBe(false);
  });
});

describe("get faculty", () => {
  it("should return all faculty for a user", async () => {
    await createFacultyFixture({
      userId: userFixtures.adminA.id,
      name: "Dr. Smith",
    });

    await createFacultyFixture({
      userId: userFixtures.adminA.id,
      name: "Dr. Johnson",
    });

    const result = await getFaculty(
      userFixtures.adminA.id
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.facultyList).toHaveLength(2);
    }
  });

  it("should return faculty ordered by name", async () => {
    await createFacultyFixture({
      userId: userFixtures.adminA.id,
      name: "Zebra",
    });

    await createFacultyFixture({
      userId: userFixtures.adminA.id,
      name: "Alpha",
    });

    const result = await getFaculty(
      userFixtures.adminA.id
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.facultyList[0].name).toBe("Alpha");
      expect(result.facultyList[1].name).toBe("Zebra");
    }
  });

  it("should only return faculty belonging to the user", async () => {
    await createFacultyFixture({
      userId: userFixtures.adminA.id,
      name: "Dr. Smith",
    });

    await createFacultyFixture({
      userId: userFixtures.adminB.id,
      name: "Dr. Johnson",
    });

    const result = await getFaculty(
      userFixtures.adminA.id
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.facultyList).toHaveLength(1);
      expect(result.facultyList[0].name).toBe("Dr. Smith");
    }
  });

  it("should fail when user id is empty", async () => {
    const result = await getFaculty("");

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error).toBe("User ID is required");
    }
  });

  it("should return an empty list when user has no faculty", async () => {
    const result = await getFaculty(
      userFixtures.adminA.id
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.facultyList).toHaveLength(0);
    }
  });
});

describe("delete faculty", () => {
  it("should delete faculty successfully", async () => {
    const faculty = await createFacultyFixture({
      userId: userFixtures.adminA.id,
    });

    const result = await deleteFaculty(
      faculty.id,
      userFixtures.adminA.id
    );

    expect(result.success).toBe(true);
  });

  it("should fail when faculty is linked to a course", async () => {
    // Arrange base system data (shared across tests)
    const seed = await seedBaseData();

    const faculty = await createFacultyFixture({
      userId: userFixtures.adminA.id,
    });

    const offering = await createCourseOfferingFixture({
      userId: userFixtures.adminA.id,
      templateId: seed.templateId,
    });

    const instance = await createFeedbackInstanceFixture({
      userId: userFixtures.adminA.id,
    });

    await createCourseFixture({
      instanceId: instance.id,
      facultyId: faculty.id,
      courseOfferingId: offering.id,
    });

    // Act
    const result = await deleteFaculty(
      faculty.id,
      userFixtures.adminA.id
    );

    // Assert
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error).toBe(DeleteErrorCode.HAS_DEPENDENCIES);

      expect(result.message).toBe(
        "Faculty is linked to courses. Remove the links first."
      );
    }
  });

  it("should fail when faculty id is empty", async () => {
    const result = await deleteFaculty(
      "",
      userFixtures.adminA.id
    );

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.message).toBe(
        "Faculty id is required"
      );
    }
  });

  it("should fail when faculty does not exist", async () => {
    const result = await deleteFaculty(
      "non-existent-id",
      userFixtures.adminA.id
    );

    expect(result.success).toBe(false);
  });

  it("should not allow deleting another user's faculty", async () => {
    const faculty = await createFacultyFixture({
      userId: userFixtures.adminB.id,
    });

    const result = await deleteFaculty(
      faculty.id,
      userFixtures.adminA.id
    );

    expect(result.success).toBe(false);
  });

  it("should remove the faculty from subsequent queries", async () => {
    const faculty = await createFacultyFixture({
      userId: userFixtures.adminA.id,
    });

    await deleteFaculty(
      faculty.id,
      userFixtures.adminA.id
    );

    const facultyResult = await getFaculty(
      userFixtures.adminA.id
    );

    expect(facultyResult.success).toBe(true);

    if (facultyResult.success) {
      expect(
        facultyResult.facultyList.find(
          (f) => f.id === faculty.id
        )
      ).toBeUndefined();
    }
  });
});