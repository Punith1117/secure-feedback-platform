import { test, expect, Page } from "@playwright/test";
import {
  clearDatabase,
  setupOfflineFeedbackScenario,
} from "../setup/setup-offline-feedback";
import { seedUsers } from "../fixtures/user.fixture";

/**
 * IMPORTANT PLAYWRIGHT CONCEPT:
 *
 * Each test runs in a completely isolated browser context.
 * This means:
 * - localStorage is NOT shared
 * - IndexedDB is NOT shared
 * - cookies are NOT shared
 *
 * Even though `scenario` is shared at file level,
 * all browser-side state is fully isolated per test.
 *
 * So tests cannot interfere with each other via frontend storage.
 */

let scenario: Awaited<
  ReturnType<typeof setupOfflineFeedbackScenario>
>;

type QueueItem = {
  id?: number;
  joinCode: string;
  accessCode: string;
  status: "pending" | "synced" | "invalid";
  createdAt: number;
  responses: {
    courseId: string;
    questionId: string;
    rating: number;
  }[];
};

async function getQueue(page: Page) {
  return page.evaluate(() => {
    return new Promise<QueueItem[]>((resolve, reject) => {
      const request = indexedDB.open("FeedbackDatabase");

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("feedbackQueue", "readonly");
        const store = tx.objectStore("feedbackQueue");
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      };
    });
  });
}

test.describe("offline feedback submit", () => {
  test.beforeAll(async () => {
    await clearDatabase();
    await seedUsers();
    scenario = await setupOfflineFeedbackScenario();
  });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();

    await page.goto("/");

    await page.evaluate((accessCode) => {
      localStorage.setItem("access_code", accessCode);
    }, scenario.accessCode);
  });

  test("should save feedback locally when offline", async ({ page }) => {
    await page.goto(`/feedback/${scenario.joinCode}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Submit Feedback" })).toBeVisible();

    await page.context().setOffline(true);

    await page.getByRole("button", { name: "Submit Feedback" }).click();

    await expect(
      page.getByText(
        "You are offline. Your response is saved and will sync automatically."
      )
    ).toBeVisible();

    const queueItems = await getQueue(page);

    expect(queueItems).toHaveLength(1);
    expect(queueItems[0].status).toBe("pending");
    expect(queueItems[0].joinCode).toBe(scenario.joinCode);
    expect(queueItems[0].accessCode).toBe(scenario.accessCode);
  });

  test("should auto-sync when back online and show toast", async ({ page }) => {
    await page.goto(`/feedback/${scenario.joinCode}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Submit Feedback" })).toBeVisible();

    await page.context().setOffline(true);

    await page.getByRole("button", { name: "Submit Feedback" }).click();

    await expect(
      page.getByText(
        "You are offline. Your response is saved and will sync automatically."
      )
    ).toBeVisible();

    await page.context().setOffline(false);

    await expect(page.getByText(/syncing feedback/i)).toBeVisible({
      timeout: 5000,
    });

    await expect(page.getByText(/feedback.*synced/i)).toBeVisible({
      timeout: 10000,
    });

    await expect.poll(async () => {
      const items = await getQueue(page);
      return items[0]?.status;
    }).toBe("synced");
  });
});