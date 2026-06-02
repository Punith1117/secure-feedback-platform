"use client";

import { deleteCourseOffering } from "@/app/actions";
import { DeleteErrorCode } from "@/types/delete-error-types";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteCourseOfferingButton({
  courseOfferingId,
  userId,
}: {
  courseOfferingId: string;
  userId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCourseOffering(courseOfferingId, userId);

      if (result.success) {
        toast.success("Course offering deleted");
        router.refresh()
      } else if (result.error === DeleteErrorCode.HAS_DEPENDENCIES) {
        toast.error("Cannot delete: course offering is used in instances. Delete the courses first.");
      } else {
        toast.error("Failed to delete");
      }
    });
  };

  return (
    <button onClick={handleDelete} disabled={isPending} className="p-1 cursor-pointer text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
  );
}