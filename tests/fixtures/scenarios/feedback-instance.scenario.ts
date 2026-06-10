import { createFeedbackInstanceFixture } from "../builders/feedback-instance.builder";
import { createFacultyFixture } from "../builders/faculty.builder";
import { createCourseOfferingFixture } from "../builders/course-offering.builder";
import { createCourseFixture } from "../builders/course.builder";

export async function buildFullFeedbackInstanceScenario() {
  const instance = await createFeedbackInstanceFixture();

  const faculty1 = await createFacultyFixture();
  const faculty2 = await createFacultyFixture({ name: "Dr. Johnson" });

  const offering1 = await createCourseOfferingFixture({ title: "DBMS" });
  const offering2 = await createCourseOfferingFixture({ title: "OS" });

  const course1 = await createCourseFixture({
    instanceId: instance.id,
    courseOfferingId: offering1.id,
    facultyId: faculty1.id,
  });

  const course2 = await createCourseFixture({
    instanceId: instance.id,
    courseOfferingId: offering2.id,
    facultyId: faculty2.id,
  });

  return {
    instance,
    faculties: [faculty1, faculty2],
    offerings: [offering1, offering2],
    courses: [course1, course2],
  };
}