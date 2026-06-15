import { seedBaseData } from "../builders/db-seeder";
import { createFeedbackInstanceFixture } from "../builders/feedback-instance.builder";
import { createFacultyFixture } from "../builders/faculty.builder";
import { createCourseOfferingFixture } from "../builders/course-offering.builder";
import { createCourseFixture } from "../builders/course.builder";

export async function buildFullFeedbackInstanceScenario() {
  const seed = await seedBaseData();

  const accessCode = "ACCESS01";
  const joinCode = "JOIN1234";

  const instance = await createFeedbackInstanceFixture({
    joinCode,
    accessCodes: {
      codes: [accessCode],
    },
  });

  const faculty1 = await createFacultyFixture({
    name: "Dr. Smith",
  });

  const offering1 = await createCourseOfferingFixture({
    title: "DBMS",
    templateId: seed.templateId,
  });

  const course1 = await createCourseFixture({
    instanceId: instance.id,
    courseOfferingId: offering1.id,
    facultyId: faculty1.id,
  });

  return {
    seed,
    joinCode,
    accessCode,
    instance,
    faculty: faculty1,
    offering: offering1,
    course: course1,
  };
}