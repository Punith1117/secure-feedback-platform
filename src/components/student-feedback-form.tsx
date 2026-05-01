"use client";

import { submitFeedback } from "@/app/actions";
import type { Course } from "@/lib/db/schema";
import { useState } from "react";

type Rating = "good" | "average" | "bad";

interface StudentFeedbackFormProps {
  courses: Course[];
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

    const responses = courses.map((course) => ({
      courseId: course.id,
      lectureQualityRating: formData.get(`lecture_quality_${course.id}`) as Rating,
      courseContentRating: formData.get(`course_content_${course.id}`) as Rating,
    }));

    // Call the server action
    const result = await submitFeedback(joinCode, accessCode, responses);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
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
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          {error}
        </div>
      )}

      {courses.map((course) => (
        <div key={course.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-slate-800">{course.title}</h2>

          <div className="space-y-6">
            {/* Question 1: Rate lecture quality */}
            <div>
              <p className="mb-3 text-slate-700">Rate lecture quality</p>
              <div className="flex gap-4">
                {(["good", "average", "bad"] as Rating[]).map((rating) => (
                  <label key={rating} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name={`lecture_quality_${course.id}`}
                      value={rating}
                      defaultChecked={rating === "average"}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="capitalize text-slate-700">{rating}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 2: Rate course content */}
            <div>
              <p className="mb-3 text-slate-700">Rate course content</p>
              <div className="flex gap-4">
                {(["good", "average", "bad"] as Rating[]).map((rating) => (
                  <label key={rating} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name={`course_content_${course.id}`}
                      value={rating}
                      defaultChecked={rating === "average"}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="capitalize text-slate-700">{rating}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

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
