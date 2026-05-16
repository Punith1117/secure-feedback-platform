import AdminInstancesGrid from "@/components/admin-instances-grid";
import AdminModalWrapper from "@/components/admin-modal-wrapper";
import CourseOfferingForm from "@/components/course-offering-form";
import CourseOfferingsSidebar from "@/components/course-offerings-sidebar";
import FacultyForm from "@/components/faculty-form";
import FacultySidebar from "@/components/faculty-sidebar";
import { getUserFeedbackInstances, getTemplates, getCourseOfferings, getFaculty } from "@/app/actions";
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

  // Get faculty
  const facultyResult = await getFaculty(user.id);
  const facultyList = facultyResult.success ? facultyResult.facultyList : [];

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Course Offerings Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Course Offerings</h2>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <CourseOfferingsSidebar offerings={offerings} />
              </div>
              <div className="flex-grow">
                <CourseOfferingForm userId={user.id} templates={templates} />
              </div>
            </div>
          </div>

          {/* Faculty Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Faculty Management</h2>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <FacultySidebar facultyList={facultyList} />
              </div>
              <div className="flex-grow">
                <FacultyForm userId={user.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal and Floating Button Wrapper */}
      <AdminModalWrapper />
    </div>
  );
}