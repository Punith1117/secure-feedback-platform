"use client";

import { submitFeedback } from "@/app/actions";
import type { Course } from "@/lib/db/schema";
import { useState } from "react";

type Rating = "good" | "average" | "bad";
import { db } from "@/lib/db/offline-db";
import { FeedbackErrorCode } from "@/types/feedback-submit-error-types";
interface StudentFeedbackFormProps {
  courses: {
    id: string;
    title: string;
    facultyName: string;
    questions: {
      id: string;
      text: string;
    }[];
  }[];
  joinCode: string;
}

const STORAGE_KEY = "access_code";

export default function StudentFeedbackForm({ courses, joinCode }: StudentFeedbackFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get access code from localStorage
    const accessCode = localStorage.getItem(STORAGE_KEY);
    if (!accessCode) {
      setError("Access code is required. Please add your access code.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);

    const responses: { courseId: string; questionId: string; rating: number }[] = [];

    for (const course of courses) {
      for (const question of course.questions) {
        const ratingStr = formData.get(`rating_${course.id}_${question.id}`) as string;
        let numericRating = 2; // Default average
        if (ratingStr === "good") numericRating = 3;
        if (ratingStr === "bad") numericRating = 1;

        responses.push({
          courseId: course.id,
          questionId: question.id,
          rating: numericRating,
        });
      }
    }

    // 1. Always store first (source of truth)
    const queueId = await db.feedbackQueue.add({
      joinCode,
      accessCode,
      responses,
      status: "pending",
      createdAt: Date.now(),
    });

    // 2. If offline -> stop here (do NOT mark synced)
    if (!navigator.onLine) {
      setLoading(false);
      setError(
        "You are offline. Your response is saved and will sync automatically."
      );
      return;
    }

    // 3. Try server sync
    try {
      const result = await submitFeedback(
        joinCode,
        accessCode,
        responses
      );

      if (result.success) {
        await db.feedbackQueue.update(queueId, {
          status: "synced",
        });

        setSuccess(true);
      } else {
        switch (result.error) {
          case FeedbackErrorCode.ACCESS_CODE_ALREADY_USED:
            setError("Access code is already used. Try a different one.")
            await db.feedbackQueue.update(queueId, {
              status: "invalid",
            });
            break;

          case FeedbackErrorCode.INVALID_ACCESS_CODE:
            setError("Invalid access code");
            await db.feedbackQueue.update(queueId, {
              status: "invalid",
            });
            break;

          case FeedbackErrorCode.MISSING_JOIN_CODE:
            setError("Join code is missing");
            await db.feedbackQueue.update(queueId, {
              status: "invalid",
            });
            break;

          case FeedbackErrorCode.MISSING_RESPONSES:
            setError("Please fill all responses");
            await db.feedbackQueue.update(queueId, {
              status: "invalid",
            });
            break;

          case FeedbackErrorCode.INACTIVE_INSTANCE:
            setError("This feedback is inactive. Response will be synced when active again. Contact the owner for more details.");
            break;

          case FeedbackErrorCode.INTERNAL_ERROR:
            setError("Server error. Your response will be synced later.");
            break;

          default: {
            setError("Unknown error. Your response will be synced later later.");
          }
        }
      }
    } catch (err) {
      setError("Error occurred while submitting form. Your response will be synced later.");
    }

    setLoading(false);
  };

// Show success message
  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <h2 className="text-2xl font-semibold text-green-800">Thank you!</h2>
        <p className="mt-2 text-green-700">Your feedback has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {courses.map((course) => (
        <div key={course.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-slate-800">
            {course.title} <span className="text-slate-500 text-base font-normal">({course.facultyName})</span>
          </h2>

          <div className="space-y-6">
            {course.questions.map((question) => (
              <div key={question.id}>
                <p className="mb-3 text-slate-700">{question.text}</p>
                <div className="flex gap-4">
                  {(["good", "average", "bad"] as Rating[]).map((rating) => (
                    <label key={rating} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`rating_${course.id}_${question.id}`}
                        value={rating}
                        defaultChecked={rating === "average"}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span className="capitalize text-slate-700">{rating}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
