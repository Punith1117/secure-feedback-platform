"use client";

import { useState } from "react";
import { createCourseOffering } from "@/app/actions";
import type { Template } from "@/lib/db/schema";
import { useRouter } from "next/navigation";

interface CourseOfferingFormProps {
  userId: string;
  templates: Template[];
}

export default function CourseOfferingForm({ userId, templates }: CourseOfferingFormProps) {
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!templateId) {
      setError("Please select a template");
      setIsLoading(false);
      return;
    }

    const result = await createCourseOffering(title, templateId, userId);

    if (result.success) {
      setSuccess(true);
      setTitle("");
      setTemplateId("");
      router.refresh(); // Refresh page to show newly added offering if we render them
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Course Offering</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Course Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="e.g. Introduction to Computer Science"
          />
        </div>

        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
            Evaluation Template
          </label>
          <select
            id="template"
            required
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="" disabled>Select a template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
            Course offering created successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create Course Offering"}
        </button>
      </form>
    </div>
  );
}
