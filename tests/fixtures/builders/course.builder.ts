import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";

type CourseOverrides = {
  id?: string;
  instanceId: string;
  courseOfferingId: string;
  facultyId: string;
};

export async function createCourseFixture(
  overrides: CourseOverrides
) {
  const [course] = await db
    .insert(courses)
    .values({
      id: overrides.id ?? crypto.randomUUID(),
      instanceId: overrides.instanceId,
      courseOfferingId: overrides.courseOfferingId,
      facultyId: overrides.facultyId,
    })
    .returning();

  return course;
}