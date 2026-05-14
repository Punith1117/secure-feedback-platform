import AdminInstancesGrid from "@/components/admin-instances-grid";
import AdminModalWrapper from "@/components/admin-modal-wrapper";
import CourseOfferingForm from "@/components/course-offering-form";
import CourseOfferingsSidebar from "@/components/course-offerings-sidebar";
import { getUserFeedbackInstances, getTemplates, getCourseOfferings } from "@/app/actions";
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

  // Get templates
  const templatesResult = await getTemplates();
  const templates = templatesResult.success ? templatesResult.templates : [];

  // Get course offerings
  const offeringsResult = await getCourseOfferings(user.id);
  const offerings = offeringsResult.success ? offeringsResult.offerings : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your feedback instances</p>
        </div>

        {/* Instances Grid Section */}
        <AdminInstancesGrid instances={instances} />

        {/* Course Offerings Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="flex-shrink-0">
            <CourseOfferingsSidebar offerings={offerings} />
          </div>

          {/* Form */}
          <div className="flex-grow">
            <CourseOfferingForm userId={user.id} templates={templates} />
          </div>
        </div>
      </div>

      {/* Modal and Floating Button Wrapper */}
      <AdminModalWrapper />
    </div>
  );
}