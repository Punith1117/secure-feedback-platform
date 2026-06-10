import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";

export async function createCourseFixture(overrides: any) {
  const [course] = await db
    .insert(courses)
    .values({
      id: overrides?.id ?? crypto.randomUUID(),
      instanceId: overrides.instanceId,
      courseOfferingId: overrides.courseOfferingId,
      facultyId: overrides.facultyId,
    })
    .returning();

  return course;
}