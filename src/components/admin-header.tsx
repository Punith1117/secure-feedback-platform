"use client"
import { SignOutButton } from "@/components/auth/signout-button"

interface AdminHeaderProps {
  user: {
    username?: string | null
    email: string
    id: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-1.5 sm:px-4 sm:py-3 border border-gray-200/50">
      <div className="flex items-center space-x-1.5 sm:space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
            <span className="text-xs font-semibold text-white">
              {(user.username || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-900">
            {user.username || "N/A"}
          </span>
        </div>
        <SignOutButton />
      </div>
    </div>
  )
}
