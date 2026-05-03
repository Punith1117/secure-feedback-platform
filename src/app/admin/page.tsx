import { SignOutButton } from "@/components/auth/signout-button";
import CreateInstanceForm from "@/components/create-instance-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Admin Dashboard
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      User Details
                    </h4>

                    <dl className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-900">
                          Username:
                        </dt>
                        <dd className="text-sm text-gray-700">
                          {user.username || "N/A"}
                        </dd>
                      </div>

                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-900">
                          Email:
                        </dt>
                        <dd className="text-sm text-gray-700">
                          {user.email}
                        </dd>
                      </div>

                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-900">
                          User ID:
                        </dt>
                        <dd className="text-sm text-gray-700 font-mono text-xs">
                          {user.id}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mt-6">
                  <SignOutButton />
                </div>
              </div>
            </div>
          </div>

          {/* Create Instance Form Section */}
          <div className="lg:col-span-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}