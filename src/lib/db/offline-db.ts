import Dexie, { type Table } from "dexie";

export interface PendingFeedback {
  id?: number;

  joinCode: string;
  accessCode: string;

  responses: {
    courseId: string;
    questionId: string;
    rating: number;
  }[];

  status: "pending" | "synced";

  createdAt: number;
}

class OfflineDatabase extends Dexie {
  feedbackQueue!: Table<PendingFeedback>;

  constructor() {
    super("FeedbackDatabase");

    this.version(1).stores({
      feedbackQueue: "++id,status,createdAt",
    });
  }
}

export const db = new OfflineDatabase();