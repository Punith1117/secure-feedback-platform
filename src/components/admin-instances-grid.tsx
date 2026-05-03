"use client";

import Link from "next/link";
import type { FeedbackInstanceWithStats } from "@/lib/db/schema";

type AdminInstancesGridProps = {
  instances: FeedbackInstanceWithStats[];
};

export default function AdminInstancesGrid({ instances }: AdminInstancesGridProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (instances.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Your Feedback Instances
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Manage and view your feedback collection instances.
          </p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No feedback instances yet
            </h3>
            <p className="text-gray-600">
              Create your first feedback instance using the form on the left.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Your Feedback Instances
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Manage and view your feedback collection instances.
        </p>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <Link
              key={instance.id}
              href={`/admin/instances/${instance.joinCode}`}
              className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 truncate">
                    {instance.title}
                  </h4>
                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        instance.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {instance.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Join Code:</span>
                    <span className="font-mono font-semibold text-blue-600">
                      {instance.joinCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Access Codes:</span>
                    <span className="font-medium text-gray-900">
                      {instance.accessCodesCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-700">
                      {formatDate(instance.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                    Click to manage →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
