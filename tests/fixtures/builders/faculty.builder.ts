import { db } from "@/lib/db";
import { faculty } from "@/lib/db/schema";

export async function createFacultyFixture(overrides?: Partial<any>) {
  const [f] = await db
    .insert(faculty)
    .values({
      id: overrides?.id ?? crypto.randomUUID(),
      userId: overrides?.userId ?? "user_admin_a",
      name: overrides?.name ?? "Dr. Smith",
    })
    .returning();

  return f;
}