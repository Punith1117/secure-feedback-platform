import { AdminHeader } from "@/components/admin-header"
import { AdminNavigation } from "@/components/admin-navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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
      <AdminNavigation />
      <AdminHeader user={user} />
      <div>
        {children}
      </div>
    </div>
  )
}
