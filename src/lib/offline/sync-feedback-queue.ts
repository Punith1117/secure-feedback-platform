import { db } from "@/lib/db/offline-db";
import { submitFeedback } from "@/app/actions";
import { FeedbackErrorCode } from "@/lib/feedback-submit-error-types";
import { toast } from "sonner";

export async function syncFeedbackQueue() {
  if (!navigator.onLine) return;

  const pendingItems = await db.feedbackQueue
    .where("status")
    .equals("pending")
    .toArray();

  if (pendingItems.length > 0) toast.loading("Syncing feedback...");

	let synced = 0;
	let failed = 0;

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
				synced++;
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
			failed++
    } catch (err) {
			failed++;
      // network failure -> keep pending
      continue;
    }
  }

	toast.dismiss()

	if (synced > 0 && failed === 0) {
		toast.success(`${synced} feedback(s) synced`);
	} else if (synced > 0 && failed > 0) {
		toast.success(`${synced} synced`);
		toast.error(`${failed} feedback(s) failed`);
	} else if (failed > 0) {
		toast.error(`${failed} feedback(s) failed`)
	}
}