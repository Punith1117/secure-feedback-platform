import { boolean, index, pgTable, pgEnum, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums for type safety
export const ratingEnum = pgEnum("rating", ["good", "average", "bad"]);
export const questionTypeEnum = pgEnum("question_type", ["lecture_quality", "course_content"]);

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

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  instanceId: uuid("instance_id")
    .notNull()
    .references(() => feedbackInstances.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  instanceIdIdx: index("courses_instance_id_idx").on(table.instanceId),
}));

// Feedback submissions - one per student attempt
export const feedbackSubmissions = pgTable("feedback_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  instanceId: uuid("instance_id")
    .notNull()
    .references(() => feedbackInstances.id, { onDelete: "cascade" }),
  accessCodeId: uuid("access_code_id")
    .notNull()
    .references(() => studentAccessCodes.id, { onDelete: "cascade" }),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (table) => ({
  accessCodeUnique: uniqueIndex("feedback_submissions_access_code_unique").on(table.accessCodeId),
  instanceIdIdx: index("feedback_submissions_instance_id_idx").on(table.instanceId),
}));

// Feedback responses - stores actual ratings
export const feedbackResponses = pgTable("feedback_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => feedbackSubmissions.id, { onDelete: "cascade" }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  questionType: questionTypeEnum("question_type").notNull(),
  rating: ratingEnum("rating").notNull(),
});

export const adminRelations = relations(admin, ({ many }) => ({
  feedbackInstances: many(feedbackInstances),
}));

export const feedbackInstanceRelations = relations(feedbackInstances, ({ one, many }) => ({
  admin: one(admin, {
    fields: [feedbackInstances.adminId],
    references: [admin.id],
  }),
  courses: many(courses),
}));

export const courseRelations = relations(courses, ({ one }) => ({
  feedbackInstance: one(feedbackInstances, {
    fields: [courses.instanceId],
    references: [feedbackInstances.id],
  }),
}));

// Submission relations
export const feedbackSubmissionRelations = relations(feedbackSubmissions, ({ one, many }) => ({
  instance: one(feedbackInstances, {
    fields: [feedbackSubmissions.instanceId],
    references: [feedbackInstances.id],
  }),
  accessCode: one(studentAccessCodes, {
    fields: [feedbackSubmissions.accessCodeId],
    references: [studentAccessCodes.id],
  }),
  responses: many(feedbackResponses),
}));

// Response relations
export const feedbackResponseRelations = relations(feedbackResponses, ({ one }) => ({
  submission: one(feedbackSubmissions, {
    fields: [feedbackResponses.submissionId],
    references: [feedbackSubmissions.id],
  }),
  course: one(courses, {
    fields: [feedbackResponses.courseId],
    references: [courses.id],
  }),
}));

// Types
export type Admin = typeof admin.$inferSelect;
export type NewAdmin = typeof admin.$inferInsert;

export type FeedbackInstance = typeof feedbackInstances.$inferSelect;
export type NewFeedbackInstance = typeof feedbackInstances.$inferInsert;

export type StudentAccessCode = typeof studentAccessCodes.$inferSelect;
export type NewStudentAccessCode = typeof studentAccessCodes.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;
export type NewFeedbackSubmission = typeof feedbackSubmissions.$inferInsert;

export type FeedbackResponse = typeof feedbackResponses.$inferSelect;
export type NewFeedbackResponse = typeof feedbackResponses.$inferInsert;
