"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteFeedbackInstance } from "@/app/actions";
import { useSession } from "@/lib/auth-client";
import type { FeedbackInstanceWithStats } from "@/lib/db/schema";

type AdminInstancesGridProps = {
  instances: FeedbackInstanceWithStats[];
};

export default function AdminInstancesGrid({ instances }: AdminInstancesGridProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const handleDelete = async (instanceId: string) => {
    if (!session?.user?.id) return;

    setDeletingId(instanceId);
    const result = await deleteFeedbackInstance(instanceId, session.user.id);
    setDeletingId(null);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete instance");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, instanceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(instanceId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      handleDelete(deletingId);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
    setShowConfirm(false);
  };

  if (instances.length === 0) {
    return (
      <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Your Feedback Instances
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Manage and view your feedback collection instances.
          </p>
        </div>
        <div className="px-5 py-8 sm:px-6 sm:py-12">
          <div className="text-center max-w-xs mx-auto">
            <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto">📋</div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
              No feedback instances yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Create your first feedback instance using the form below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">
          Your Feedback Instances
        </h3>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
          Manage and view your feedback collection instances.
        </p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {instances.map((instance) => (
            <div
              key={instance.id}
              className="relative p-5 sm:p-6 border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-slate-50/50"
            >
              <Link
                href={`/admin/instances/${instance.joinCode}`}
                className="block"
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate pr-8" title={instance.title}>
                      {instance.title}
                    </h4>
                    <div className="flex items-center mt-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                          instance.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {instance.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Join Code:</span>
                      <span className="font-mono font-bold text-blue-600">
                        {instance.joinCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Access Codes:</span>
                      <span className="font-semibold text-slate-900">
                        {instance.accessCodesCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Created:</span>
                      <span className="text-slate-700">
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

              <button
                onClick={(e) => handleDeleteClick(e, instance.id)}
                disabled={deletingId === instance.id}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete instance"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={handleCancelDelete} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Instance</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this instance? This action cannot be undone and will delete all associated data.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
