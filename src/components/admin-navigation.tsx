"use client"
import { useRouter } from "next/navigation"

export function AdminNavigation() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back()
    } else {
      router.push("/admin")
    }
  }

  return (
    <button
      onClick={handleBack}
      className="fixed top-4 left-4 z-50 bg-white shadow-lg rounded-lg px-3 py-2.5 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-2 group"
    >
      <svg 
        className="w-4 h-4 text-gray-600 group-hover:text-gray-900" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
        Back
      </span>
    </button>
  )
}
