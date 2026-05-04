import { AdminHeader } from "@/components/admin-header"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  const user = session.user

  return (
    <div className="relative">
      <AdminHeader user={user} />
      <div className="pt-16">
        {children}
      </div>
    </div>
  )
}
