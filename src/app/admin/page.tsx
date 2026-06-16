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
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-12">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-10 pt-8 sm:pt-0">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <a
            href="https://github.com/Punith1117/secure-feedback-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-slate-900 underline underline-offset-4 decoration-slate-400 hover:decoration-slate-900 transition-all duration-200 hover:drop-shadow-sm"          >
            by Punith1117
          </a>
          <p className="mt-1 text-sm sm:text-lg text-slate-600">Manage your feedback infrastructure</p>
        </div>

        {/* Instances Grid Section */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 px-1">Feedback Instances</h2>
          <AdminInstancesGrid instances={instances} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Course Offerings Section */}
          <section className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Course Offerings</h2>
            <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-start">
              <div className="w-full xl:w-64 flex-shrink-0">
                <CourseOfferingsSidebar offerings={offerings} />
              </div>
              <div className="w-full flex-grow">
                <CourseOfferingForm userId={user.id} templates={templates} />
              </div>
            </div>
          </section>

          {/* Faculty Section */}
          <section className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Faculty Management</h2>
            <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-start">
              <div className="w-full xl:w-64 flex-shrink-0">
                <FacultySidebar facultyList={facultyList} />
              </div>
              <div className="w-full flex-grow">
                <FacultyForm userId={user.id} />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal and Floating Button Wrapper */}
      <AdminModalWrapper />
    </div>
  );
}