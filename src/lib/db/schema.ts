import { boolean, index, text, pgTable, pgEnum, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums for type safety
export const ratingEnum = pgEnum("rating", ["good", "average", "bad"]);
export const questionTypeEnum = pgEnum("question_type", ["lecture_quality", "course_content"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
});

export const feedbackInstances = pgTable("feedback_instances", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  joinCode: varchar("join_code", { length: 8 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("feedback_instances_user_id_idx").on(table.userId),
}));

export const studentAccessCodes = pgTable("student_access_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  instanceId: uuid("instance_id")
    .notNull()
    .references(() => feedbackInstances.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 8 }).notNull(),
  used: boolean("used").default(false).notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  instanceIdIdx: index("student_access_codes_instance_id_idx").on(table.instanceId),
  
  // Ensure each code is unique within the same feedback instance
  instanceCodeUnique: uniqueIndex("student_access_codes_instance_code_unique").on(
    table.instanceId,
    table.code
  ),
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

export const feedbackInstanceRelations = relations(feedbackInstances, ({ one, many }) => ({
  user: one(user, {
    fields: [feedbackInstances.userId],
    references: [user.id],
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



export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  feedbackInstances: many(feedbackInstances),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Type for feedback instances with additional stats
export type FeedbackInstanceWithStats = FeedbackInstance & {
  accessCodesCount: number;
};
