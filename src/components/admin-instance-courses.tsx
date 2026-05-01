"use client";

import { useState } from "react";
import { createCourse } from "@/app/actions";
import type { Course } from "@/lib/db/schema";

type AdminInstanceCoursesProps = {
  instanceId: string;
  joinCode: string;
  instanceTitle: string;
  initialCourses: Course[];
};

export default function AdminInstanceCourses({
  instanceId,
  joinCode,
  instanceTitle,
  initialCourses,
}: AdminInstanceCoursesProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setMessage({ type: "error", text: "Course title is required." });
      return;
    }

    setIsSubmitting(true);

    const result = await createCourse(instanceId, trimmedTitle);

    if (result.success) {
      setCourses((current) => [...current, result.course]);
      setTitle("");
      setMessage({ type: "success", text: "Course added successfully." });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to add course." });
    }

    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8 w-full max-w-3xl px-4 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Admin instance</p>
          <h1 className="text-3xl font-semibold text-slate-900">{instanceTitle}</h1>
          <p className="mt-1 text-sm text-slate-600">Join code: <span className="font-mono">{joinCode}</span></p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="courseTitle" className="block text-sm font-medium text-slate-700">
                Course Title
              </label>
              <input
                id="courseTitle"
                name="courseTitle"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter course title"
                disabled={isSubmitting}
              />
            </div>

            {message && (
              <div className={`rounded-2xl px-4 py-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Adding course..." : "Add Course"}
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Courses</h2>
            <p className="text-sm text-slate-600">All courses for this feedback instance.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </span>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
            No courses have been added yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {courses.map((course) => (
              <li key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{course.title}</p>
                <p className="mt-2 text-xs text-slate-500">Course ID: {course.id}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
