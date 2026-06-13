import { getCoursesByInstanceIdForStudent, getFeedbackInstanceForStudent } from "@/app/actions";
import AccessCodeInput from "@/components/access-code-input";
import StudentFeedbackForm from "@/components/student-feedback-form";
import Link from "next/link";

export default async function FeedbackPage({ params }: { params: Promise<{ join_code: string }> }) {
  const { join_code: joinCode } = await params;

  const instanceResult = await getFeedbackInstanceForStudent(joinCode);

  if (!instanceResult.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-center">
        <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-rose-800">Unable to load feedback</h1>
          <p className="mt-4 text-slate-600">{instanceResult.error}</p>
        </div>
      </div>
    );
  }

  const instance = instanceResult.instance;

  if (!instance.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-center">
        <div className="w-full max-w-xl rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-amber-800">Feedback Inactive</h1>
          <p className="mt-4 text-slate-600">This feedback instance is currently inactive and not accepting responses.</p>
          <div className="mt-6">
            <Link 
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800 shadow-sm"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const coursesResult = await getCoursesByInstanceIdForStudent(instance.id);
  const courses = coursesResult.success ? coursesResult.courses : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-3xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">{instance.title}</h1>
          <AccessCodeInput />
        </div>
        <p className="mb-8 text-center text-slate-600">Please provide your feedback for each course</p>

        <StudentFeedbackForm courses={courses} joinCode={joinCode} />
      </div>
    </div>
  );
}
