"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Share, Eye } from "lucide-react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
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
  const [activeTab, setActiveTab] = useState("overview")
  const { isAuthenticated } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const postsPerPage = 10

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("[v0] Fetching profile for:", username)
        const profile = await getUserByUsername(username)
        console.log("[v0] Profile fetched:", profile)
        setUserProfile(profile)

        if (profile) {
          const offset = (currentPage - 1) * postsPerPage
          console.log("[v0] Fetching posts - userId:", profile.$id, "page:", currentPage, "offset:", offset)
          const postsResponse = await getPostsByAuthor(profile.$id, postsPerPage, offset)
setPosts(postsResponse.documents || [])
console.log("Profile ID:", profile.$id)
console.log("Posts response:", postsResponse)

          setTotalPosts(postsResponse.total || 0)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [username, currentPage])

  const totalPages = Math.ceil(totalPosts / postsPerPage)

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const avatarInitial = userProfile?.name?.[0]?.toUpperCase() || "U"
  const memberSince = userProfile?.$createdAt 
    ? new Date(userProfile.$createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown"

  // Calculate reddit age in weeks
  const redditAgeWeeks = userProfile?.$createdAt
    ? Math.floor((Date.now() - new Date(userProfile.$createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => {}} />
          <main className="flex-1 max-w-4xl px-6 py-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
        <div className="flex relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => {}} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500 dark:text-gray-400">User not found</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)} />

        {/* Main Content */}
        <div className="flex flex-1 gap-6">
          {/* Feed */}
          <main className={`flex-1 transition-[margin] duration-300 ease-in-out ${
            isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}>
            <div className="max-w-2xl mx-auto py-6">
              {/* Profile Header - Compact Style */}
              <div className="flex items-start gap-4 mb-8">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-3xl flex-shrink-0 shadow-md">
                  {avatarInitial}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">u/{userProfile.name}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-16 z-20 overflow-x-auto -mx-6 px-6 mb-6">
                <div className="flex gap-6 whitespace-nowrap">
                  {["overview", "posts", "comments", "saved", "history", "hidden", "upvoted", "downvoted"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab
                          ? "text-gray-900 dark:text-white border-orange-600"
                          : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                    <Eye size={18} />
                    <span>Showing all content</span>
                  </div>

                  {posts.length > 0 && (
                    <div className="space-y-4">
                      {posts.slice(0, 3).map((post) => (
                        <PostCard key={post.$id} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "posts" && (
                <>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6">
                    <Eye size={18} />
                    <span>Showing all content</span>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <PostSkeleton key={i} />
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <>
                      <div className="space-y-4 mb-8">
                        {posts.map((post) => (
                          <PostCard key={post.$id} post={post} />
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pb-6">
                          <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                  currentPage === page
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
                    </div>
                  )}
                </>
              )}

              {["comments", "saved", "history", "hidden", "upvoted", "downvoted"].includes(activeTab) && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Coming soon...</p>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80">
            <div className="sticky top-20 space-y-4">
              {/* Profile Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
                {/* Dark Banner */}
                <div className="h-24 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900"></div>

                {/* Card Content */}
                <div className="px-4 py-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{userProfile.name}</h3>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-full font-semibold transition-colors mb-6">
                    <Share size={16} />
                    <span>Share</span>
                  </button>

                  {/* Stats Grid */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-800">
                      <span className="text-gray-600 dark:text-gray-400">followers</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">0</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">1</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Karma</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{totalPosts}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Contributions</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{redditAgeWeeks}w</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Reddit Age</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">1</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Active in</p>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="border-t border-gray-200 dark:border-slate-800 pt-4 mb-4">
                    <h4 className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-3">Achievements</h4>
                    <div className="flex gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">🏆</div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold">⭐</div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">🎯</div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">6 unlocked <button className="text-orange-600 hover:underline">View All</button></p>
                  </div>
                </div>
              </div>

              {/* Settings Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-3">Settings</h4>
                <div className="space-y-3">
                  {[
                    { title: "Profile", desc: "Customize your profile", icon: "👤" },
                    { title: "Avatar", desc: "Style your avatar", icon: "🖼️" },
                    { title: "Banner", desc: "Customize your banner", icon: "🎨" },
                  ].map((setting) => (
                    <div key={setting.title} className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{setting.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{setting.desc}</p>
                      </div>
                      <button className="text-xs font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 px-3 py-1 rounded transition-colors">
                        Update
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
