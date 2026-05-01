import { getCoursesByInstanceId, getInstanceByJoinCode } from "@/app/actions";
import AdminInstanceCourses from "@/components/admin-instance-courses";

export default async function Page({ params }: { params: Promise<{ join_code: string }> }) {
  const { join_code: joinCode } = await params;
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

  const instance = instanceResult.instance;
  const coursesResult = await getCoursesByInstanceId(instance.id);
  const courses = coursesResult.success ? coursesResult.courses : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 py-8">
        <AdminInstanceCourses
          instanceId={instanceResult.instance.id}
          instanceTitle={instanceResult.instance.title}
          joinCode={instanceResult.instance.joinCode}
          initialCourses={courses}
        />
      </div>
    </div>
  );
}
