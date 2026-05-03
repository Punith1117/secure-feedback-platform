import { getAccessCodesByInstanceId, getCoursesByInstanceId, getFeedbackResponsesByInstanceId, getInstanceByJoinCode } from "@/app/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AdminInstanceAccessCodes from "@/components/admin-instance-access-codes";
import AdminInstanceCourses from "@/components/admin-instance-courses";
import AdminInstanceFeedback from "@/components/admin-instance-feedback";

export default async function Page({ params }: { params: Promise<{ join_code: string }> }) {
  const { join_code: joinCode } = await params;
  
  // Get current user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-center">
        <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-rose-800">Access Denied</h1>
          <p className="mt-4 text-slate-600">You must be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  const instanceResult = await getInstanceByJoinCode(joinCode);

  if (!instanceResult.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-center">
        <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-rose-800">Unable to load instance</h1>
          <p className="mt-4 text-slate-600">{instanceResult.error}</p>
        </div>
      </div>
    );
  }

  // Verify user owns this instance
  if (instanceResult.instance.userId !== session.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-center">
        <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-rose-800">Access Denied</h1>
          <p className="mt-4 text-slate-600">You don't have permission to view this instance.</p>
        </div>
      </div>
    );
  }

  const instance = instanceResult.instance;
  const coursesResult = await getCoursesByInstanceId(instance.id, session.user.id);
  const courses = coursesResult.success ? coursesResult.courses : [];

  const accessCodesResult = await getAccessCodesByInstanceId(instance.id, session.user.id);
  const accessCodes = accessCodesResult.success ? accessCodesResult.accessCodes : [];

  const feedbackResult = await getFeedbackResponsesByInstanceId(instance.id, session.user.id);
  const feedbackData = feedbackResult.success ? feedbackResult.feedback : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 py-8">
        <AdminInstanceFeedback
          instanceTitle={instanceResult.instance.title}
          joinCode={instanceResult.instance.joinCode}
          feedback={feedbackData}
        />
        <div className="flex gap-6">
          <AdminInstanceCourses
            instanceId={instanceResult.instance.id}
            instanceTitle={instanceResult.instance.title}
            joinCode={instanceResult.instance.joinCode}
            initialCourses={courses}
          />
          <AdminInstanceAccessCodes
            instanceId={instanceResult.instance.id}
            initialAccessCodes={accessCodes}
          />
        </div>
      </div>
    </div>
  );
}
