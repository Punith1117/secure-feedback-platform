import CreateInstanceForm from "@/components/create-instance-form";
import AdminInstancesGrid from "@/components/admin-instances-grid";
import { getUserFeedbackInstances } from "@/app/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Session not found - this should be handled by layout");
  }

  const user = session.user;

  // Get user's feedback instances
  const instancesResult = await getUserFeedbackInstances(user.id);
  const instances = instancesResult.success ? instancesResult.instances : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your feedback instances</p>
        </div>

        {/* Create Instance Form Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Create New Feedback Instance
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Set up a new feedback collection instance for your courses.
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <CreateInstanceForm />
          </div>
        </div>

        {/* Instances Grid Section */}
        <AdminInstancesGrid instances={instances} />
      </div>
    </div>
  );
}