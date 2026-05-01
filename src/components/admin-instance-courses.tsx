"use client";

import { useState } from "react";
import { createCourse, deleteCourse, updateInstanceTitle } from "@/app/actions";
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
  const [instanceTitleLocal, setInstanceTitleLocal] = useState(instanceTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(instanceTitle);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleUpdateTitle() {
    const trimmedTitle = editedTitle.trim();
    if (!trimmedTitle) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }

    setIsSubmitting(true);
    const result = await updateInstanceTitle(instanceId, trimmedTitle);

    if (result.success) {
      setInstanceTitleLocal(result.instance.title);
      setIsEditingTitle(false);
      setMessage({ type: "success", text: "Title updated successfully." });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update title." });
    }

    setIsSubmitting(false);
  }

  function cancelTitleEdit() {
    setEditedTitle(instanceTitleLocal);
    setIsEditingTitle(false);
    setMessage(null);
  }

  async function handleDeleteCourse(courseId: string) {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    setIsSubmitting(true);
    const result = await deleteCourse(courseId);

    if (result.success) {
      setCourses((current) => current.filter((c) => c.id !== courseId));
      setMessage({ type: "success", text: "Course deleted successfully." });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to delete course." });
    }

    setIsSubmitting(false);
  }

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
          {isEditingTitle ? (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={editedTitle}
                onChange={(event) => setEditedTitle(event.target.value)}
                className="flex-1 rounded-2xl border border-slate-300 px-4 py-2 text-xl font-semibold text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUpdateTitle}
                  disabled={isSubmitting}
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelTitleEdit}
                  disabled={isSubmitting}
                  className="rounded-2xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-900">{instanceTitleLocal}</h1>
              <button
                type="button"
                onClick={() => {
                  setEditedTitle(instanceTitleLocal);
                  setIsEditingTitle(true);
                  setMessage(null);
                }}
                className="rounded-xl bg-slate-100 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-200"
              >
                Edit
              </button>
            </div>
          )}
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
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{course.title}</p>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(course.id)}
                    disabled={isSubmitting}
                    className="rounded-xl bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Course ID: {course.id}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
