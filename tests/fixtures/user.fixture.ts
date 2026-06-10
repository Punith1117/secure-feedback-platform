import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export const testUsers = {
  admin: {
    id: "user_admin_a",
    name: "Admin User",
    email: "admin@test.com",
    emailVerified: true,
  },
};

export async function seedUsers() {
  await db.insert(user).values(testUsers.admin);
}