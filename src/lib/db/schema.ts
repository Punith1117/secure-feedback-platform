import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const admin = pgTable("admin", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbackInstances = pgTable("feedback_instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  joinCode: varchar("join_code", { length: 8 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;

export type FeedbackInstance = typeof feedbackInstances.$inferSelect;
export type NewFeedbackInstance = typeof feedbackInstances.$inferInsert;
