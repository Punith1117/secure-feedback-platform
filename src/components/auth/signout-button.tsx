"use client"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
	const router = useRouter()

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.replace("/")
				},
			},
		})
	}

	return (
		<button 
			onClick={handleSignOut}
			className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 border border-transparent rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
			title="Sign out"
		>
			<span className="hidden sm:inline">Sign out</span>
			<svg className="h-5 w-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
			</svg>
		</button>
	)
}