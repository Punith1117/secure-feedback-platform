import { boolean, index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const admin = pgTable("admin", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbackInstances = pgTable("feedback_instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").notNull().references(() => admin.id, { onDelete: "cascade" }),
  joinCode: varchar("join_code", { length: 8 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  adminIdIdx: index("feedback_instances_admin_id_idx").on(table.adminId),
}));

export const studentAccessCodes = pgTable("student_access_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  instanceId: uuid("instance_id")
    .notNull()
    .references(() => feedbackInstances.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 8 }).notNull().unique(),
  used: boolean("used").default(false).notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  instanceIdIdx: index("student_access_codes_instance_id_idx").on(table.instanceId),
}));

export const adminRelations = relations(admin, ({ many }) => ({
  feedbackInstances: many(feedbackInstances),
}));

export const feedbackInstanceRelations = relations(feedbackInstances, ({ one }) => ({
  admin: one(admin, {
    fields: [feedbackInstances.adminId],
    references: [admin.id],
  }),
}));

export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;

export type FeedbackInstance = typeof feedbackInstances.$inferSelect;
export type NewFeedbackInstance = typeof feedbackInstances.$inferInsert;

export type StudentAccessCode = typeof studentAccessCodes.$inferSelect;
export type NewStudentAccessCode = typeof studentAccessCodes.$inferInsert;
