"use client";

import { useState } from "react";
import CreateInstanceForm from "@/components/create-instance-form";
import Modal from "@/components/modal";
import FloatingAddButton from "@/components/floating-add-button";
import { useRouter } from "next/navigation";

export default function AdminModalWrapper() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Refresh the page to show new instances
    router.refresh();
  };

  return (
    <>
      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setIsModalOpen(true)} />

      {/* Create Instance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Create New Feedback Instance"
      >
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Set up a new feedback collection instance for your courses.
          </p>
        </div>
        <CreateInstanceForm onClose={handleModalClose} />
      </Modal>
    </>
  );
}
