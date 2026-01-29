"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Share } from "lucide-react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal"
import { PostCard } from "@/components/post-card"
import { PostSkeleton } from "@/components/post-skeleton"
import { getUserByUsername } from "@/lib/user"
import { getPostsByAuthor, enrichPosts } from "@/lib/post"
import { useAuth } from "@/app/providers"

export default function UserProfile() {
  const params = useParams()
  const username = params.username as string
  const [userProfile, setUserProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserByUsername(username)
        setUserProfile(profile)

        if (profile) {
          const postsResponse = await getPostsByAuthor(profile.userId, 20, 0)
          const enrichedPosts = await enrichPosts(postsResponse.documents)
          setPosts(enrichedPosts)
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [username])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
          <main className="flex-1 max-w-4xl px-6 py-6">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 animate-pulse">
              <div className="h-32 bg-gray-300 dark:bg-slate-700" />
              <div className="px-6 pb-6 pt-4 space-y-4">
                <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded w-48" />
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-300 dark:bg-slate-700 rounded" />
                  ))}
                </div>
              </div>
            </div>

            {/* Posts Skeleton */}
            <div className="px-6 py-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500 dark:text-gray-400">User not found</p>
          </main>
        </div>
      </div>
    )
  }

  const avatarInitial = userProfile.name?.[0]?.toUpperCase() || "U"
  const memberSince = new Date(userProfile.$createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />

        <main className="flex-1 max-w-4xl">
          {/* Profile Header Section */}
          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
            {/* Dark Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900"></div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div className="flex items-end gap-4">
                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-5xl border-4 border-white dark:border-slate-900 -mt-14 shadow-lg">
                    {avatarInitial}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userProfile.name}</h1>
                    <p className="text-gray-600 dark:text-gray-300">u/{userProfile.name}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors">
                  <Share size={18} />
                  <span>Share</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">0</p>
                  <p className="text-gray-600 dark:text-gray-400">followers</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{posts.length}</p>
                  <p className="text-gray-600 dark:text-gray-400">karma</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">1</p>
                  <p className="text-gray-600 dark:text-gray-400">Reddit Age</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{memberSince.split(",")[1]}</p>
                  <p className="text-gray-600 dark:text-gray-400">Active in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20">
            <div className="px-6 flex gap-8">
              {["overview", "posts", "comments", "saved", "history", "hidden", "upvoted", "downvoted"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? "text-gray-900 dark:text-white border-blue-600"
                      : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Member since</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{memberSince}</p>
                    </div>
                    {userProfile.bio && (
                      <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Bio</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{userProfile.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <PostSkeleton key={i} />
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h3>
                    <div className="space-y-4">
                      {posts.slice(0, 3).map((post) => (
                        <PostCard key={post.$id} post={post} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "posts" && (
              <div className="space-y-4">
                {isLoading ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <PostSkeleton key={i} />
                    ))}
                  </>
                ) : posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post.$id} post={post} />)
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
                  </div>
                )}
              </div>
            )}

            {["comments", "saved", "history", "hidden", "upvoted", "downvoted"].includes(activeTab) && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Coming soon...</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 pl-4 py-6 hidden xl:block">
          <div className="sticky top-20 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white">About u/{userProfile.name}</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Member since</p>
                <p className="text-gray-600 dark:text-gray-300">{memberSince}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Post karma</p>
                <p className="text-gray-600 dark:text-gray-300">0</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Comment karma</p>
                <p className="text-gray-600 dark:text-gray-300">0</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
