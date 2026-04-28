import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const admin = pgTable("admin", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;
