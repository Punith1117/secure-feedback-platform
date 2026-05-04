"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const router = useRouter();

  const handleGiveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      router.push(`/feedback/${joinCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Secure Feedback Platform
          </h1>
          <p className="text-gray-600">
            Choose your role to get started
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Login Section */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Admin Login
              </h2>
              <p className="text-gray-600">
                Sign in to manage feedback instances
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign In
              </Link>
              
              <Link
                href="/auth/signup"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Student Join Section */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Student Join
              </h2>
              <p className="text-gray-600">
                Enter your join code to provide feedback
              </p>
            </div>
            
            <form onSubmit={handleGiveFeedback} className="space-y-4">
              <div>
                <label htmlFor="join-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Join Code
                </label>
                <input
                  id="join-code"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter join code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Give Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
