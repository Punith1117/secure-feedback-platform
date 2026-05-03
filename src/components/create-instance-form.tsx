"use client";

import { useState } from "react";
import { createFeedbackInstance } from "@/app/actions";
import { useSession } from "@/lib/auth-client";

export default function CreateInstanceForm() {
  const [title, setTitle] = useState("");
  const [numberOfStudents, setNumberOfStudents] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; joinCode?: string } | null>(null);
  const { data: session } = useSession();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!session?.user?.id) {
      setMessage({ type: "error", text: "You must be logged in to create an instance" });
      setIsSubmitting(false);
      return;
    }

    const result = await createFeedbackInstance(title, numberOfStudents, session.user.id);

    if (result.success) {
      setTitle("");
      setNumberOfStudents(1);
      setMessage({
        type: "success",
        text: "Feedback instance created successfully!",
        joinCode: result.joinCode,
      });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to create instance" });
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700">
          Instance Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter instance title"
          className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="numberOfStudents" className="block text-sm font-medium mb-1 text-gray-700">
          Number of Students
        </label>
        <input
          id="numberOfStudents"
          type="number"
          min="1"
          value={numberOfStudents}
          onChange={(e) => setNumberOfStudents(parseInt(e.target.value) || 1)}
          placeholder="Enter number of students"
          className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
      </div>

      {message && (
        <div
          className={`text-sm p-3 rounded-md ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          <p>{message.text}</p>
          {message.joinCode && (
            <p className="mt-1 font-mono font-bold">
              Join Code: {message.joinCode}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Creating..." : "Create Instance"}
      </button>
    </form>
  );
}
