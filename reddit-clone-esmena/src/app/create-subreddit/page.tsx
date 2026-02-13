"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createSubredditSchema } from "@/lib/schemas"
import { createSubreddit } from "@/lib/subreddit"
import { useAuth } from "@/app/providers"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal" // Import AuthModal

export default function CreateSubreddit() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false) // Declare isAuthModalOpen

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSubredditSchema),
  })

  const onSubmit = async (data: any) => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const subreddit = await createSubreddit(data.name, data.description || "", user.$id)
      router.push(`/r/${subreddit.name}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={false} isCollapsed={false} onToggleCollapse={() => {}} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-gray-600 mb-6">You must be logged in to create a community</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={false} onToggleCollapse={() => {}} />

        <main className="flex-1 max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Community</h1>
            <p className="text-gray-600 mb-8">Start a community and become a moderator</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Community Name</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">r/</span>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="community-name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-2">{String(errors.name.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description (Optional)</label>
                <textarea
                  {...register("description")}
                  placeholder="What's your community about?"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-2">{String(errors.description.message)}</p>
                )}
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create Community"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-2 border border-gray-300 text-gray-900 rounded-full font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
