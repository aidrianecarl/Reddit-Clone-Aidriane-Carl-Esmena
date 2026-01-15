"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPostSchema } from "@/lib/schemas"
import { createPost } from "@/lib/post"
import { getSubredditByName } from "@/lib/subreddit"
import { useAuth } from "@/app/providers"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal"

export default function SubmitPost() {
  const router = useRouter()
  const params = useParams()
  const subredditName = params.subreddit as string
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPostSchema),
  })

  const onSubmit = async (data: any) => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const subreddit = await getSubredditByName(subredditName)
      if (!subreddit) {
        throw new Error("Subreddit not found")
      }

      await createPost(data.title, data.content || "", data.imageUrl || "", subreddit.$id, user.$id)
      router.push(`/r/${subredditName}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={false} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-gray-600 mb-6">You must be logged in to create a post</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold"
              >
                Log In
              </button>
            </div>
          </main>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />

        <main className="flex-1 max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Post</h1>
            <p className="text-gray-600 mb-8">r/{subredditName}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                <input
                  {...register("title")}
                  type="text"
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.title && <p className="text-red-500 text-sm mt-2">{String(errors.title.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Content (Optional)</label>
                <textarea
                  {...register("content")}
                  placeholder="Add more details..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.content && <p className="text-red-500 text-sm mt-2">{String(errors.content.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Image URL (Optional)</label>
                <input
                  {...register("imageUrl")}
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.imageUrl && <p className="text-red-500 text-sm mt-2">{String(errors.imageUrl.message)}</p>}
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold disabled:opacity-50"
                >
                  {isLoading ? "Posting..." : "Post"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-3 border border-gray-300 text-gray-900 rounded-full font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
