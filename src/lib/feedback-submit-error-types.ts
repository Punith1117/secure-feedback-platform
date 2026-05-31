export const FeedbackErrorCode = {
  MISSING_JOIN_CODE: "MISSING_JOIN_CODE",
  MISSING_ACCESS_CODE: "MISSING_ACCESS_CODE",
  MISSING_RESPONSES: "MISSING_RESPONSES",

  INVALID_JOIN_CODE: "INVALID_JOIN_CODE",
  INVALID_ACCESS_CODE: "INVALID_ACCESS_CODE",

  INACTIVE_INSTANCE: "INACTIVE_INSTANCE",

  ACCESS_CODE_ALREADY_USED: "ACCESS_CODE_ALREADY_USED",

  INVALID_RESPONSE: "INVALID_RESPONSE",
  COURSE_NOT_FOUND: "COURSE_NOT_FOUND",

  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type FeedbackErrorCode = (typeof FeedbackErrorCode)[keyof typeof FeedbackErrorCode];

export type SubmitFeedbackResult =
  | { success: true }
  | { success: false; error: FeedbackErrorCode; message?: string };