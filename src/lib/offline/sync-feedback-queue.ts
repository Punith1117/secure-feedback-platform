import { db } from "@/lib/db/offline-db";
import { submitFeedback } from "@/app/actions";
import { FeedbackErrorCode } from "@/lib/feedback-submit-error-types";

export async function syncFeedbackQueue() {
  if (!navigator.onLine) return;

  const pendingItems = await db.feedbackQueue
    .where("status")
    .equals("pending")
    .toArray();

  for (const item of pendingItems) {
    try {
      const result = await submitFeedback(
        item.joinCode,
        item.accessCode,
        item.responses
      );

      if (result.success) {
        await db.feedbackQueue.update(item.id!, {
          status: "synced",
        });
        continue;
      }

      // handle server errors
      switch (result.error) {
        case FeedbackErrorCode.ACCESS_CODE_ALREADY_USED:
          await db.feedbackQueue.update(item.id!, {
            status: "invalid",
          });
          break;

        case FeedbackErrorCode.INTERNAL_ERROR:
        case FeedbackErrorCode.INACTIVE_INSTANCE:
          // keep pending for retry later
          break;

        default:
          await db.feedbackQueue.update(item.id!, {
            status: "invalid",
          });
      }
    } catch (err) {
      // network failure -> keep pending
      continue;
    }
  }
}