import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export const testUsers = {
  adminA: {
    id: "user_admin_a",
    name: "Admin A",
    email: "a@test.com",
    emailVerified: true,
  },
  adminB: {
    id: "user_admin_b",
    name: "Admin B",
    email: "b@test.com",
    emailVerified: true,
  },
};

export async function seedUsers() {
  await db.insert(user).values([
    testUsers.adminA, 
    testUsers.adminB
  ]);
}