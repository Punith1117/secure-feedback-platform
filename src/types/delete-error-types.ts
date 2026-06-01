export const DeleteErrorCode = {
  HAS_DEPENDENCIES: "HAS_DEPENDENCIES",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type DeleteErrorCode =
  (typeof DeleteErrorCode)[keyof typeof DeleteErrorCode];

export type DeleteResult =
  | { success: true }
  | { success: false; error: DeleteErrorCode; message?: string };