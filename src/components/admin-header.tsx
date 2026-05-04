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
    <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg px-4 py-3 border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {(user.username || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {user.username || "N/A"}
          </span>
        </div>
        <SignOutButton />
      </div>
    </div>
  )
}
