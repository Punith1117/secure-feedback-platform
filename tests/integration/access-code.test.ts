import { describe, it, expect } from "vitest";

import {
  getAccessCodesByInstanceId,
  getNewAccessCode,
} from "@/app/actions";

import { createFeedbackInstanceFixture } from "../fixtures/builders/feedback-instance.builder";
import { seedBaseData } from "../fixtures/builders/db-seeder";

describe("get access codes by instance id", () => {
  it("should reject invalid instance id", async () => {
    await seedBaseData();

    const res = await getAccessCodesByInstanceId(
      "invalid-id",
      "user_admin_a",
    );

    expect(res.success).toBe(false);

    if (!res.success) {
      expect(res.error).toBe(
        "Valid feedback instance ID is required",
      );
    }
  });

  it("should reject missing user id", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const res = await getAccessCodesByInstanceId(
      instance.id,
      "",
    );

    expect(res.success).toBe(false);

    if (!res.success) {
      expect(res.error).toBe("User ID is required");
    }
  });

  it("should reject access from non-owner", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const res = await getAccessCodesByInstanceId(
      instance.id,
      "user_admin_b",
    );

    expect(res.success).toBe(false);

    if (!res.success) {
      expect(res.error).toBe(
        "Feedback instance not found or access denied",
      );
    }
  });

  it("should return access codes for owned instance", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
      accessCodes: {
        codes: ["CODE1", "CODE2", "CODE3"],
      },
    });

    const res = await getAccessCodesByInstanceId(
      instance.id,
      "user_admin_a",
    );

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.accessCodes).toHaveLength(3);
      expect(
        res.accessCodes.map((c) => c.code),
      ).toEqual(expect.arrayContaining(["CODE1", "CODE2", "CODE3"]));
    }
  });
});

describe("get new access code", () => {
  it("should reject invalid instance id", async () => {
    await seedBaseData();

    const res = await getNewAccessCode(
      "invalid-id",
      "user_admin_a",
    );

    expect(res.success).toBe(false);

    if (!res.success) {
      expect(res.error).toBe(
        "Valid feedback instance ID is required",
      );
    }
  });

  it("should reject missing user id", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const res = await getNewAccessCode(
      instance.id,
      "",
    );

    expect(res.success).toBe(false);

    if (!res.success) {
      expect(res.error).toBe("User ID is required");
    }
  });

  it("should reject access from non-owner", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const res = await getNewAccessCode(
      instance.id,
      "user_admin_b",
    );

    expect(res.success).toBe(false);

    if (!res.success) {
      expect(res.error).toBe(
        "Feedback instance not found or access denied",
      );
    }
  });

  it("should create a new access code", async () => {
    await seedBaseData();

    const instance = await createFeedbackInstanceFixture({
      userId: "user_admin_a",
    });

    const before = await getAccessCodesByInstanceId(
      instance.id,
      "user_admin_a",
    );

    expect(before.success).toBe(true);

    const res = await getNewAccessCode(
      instance.id,
      "user_admin_a",
    );

    expect(res.success).toBe(true);

    if (res.success) {
      expect(res.accessCode.instanceId).toBe(instance.id);
      expect(res.accessCode.code).toHaveLength(8);
      expect(res.accessCode.used).toBe(false);
    }

    const after = await getAccessCodesByInstanceId(
      instance.id,
      "user_admin_a",
    );

    expect(after.success).toBe(true);

    if (before.success && after.success) {
      expect(after.accessCodes.length).toBe(
        before.accessCodes.length + 1,
      );
    }
  });
});