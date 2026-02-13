"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { PostCard } from "@/components/post-card"
import { PostSkeleton } from "@/components/post-skeleton"
import { SortButtons } from "@/components/sort-buttons"
import { useAuth } from "@/app/providers"
import { getHomeFeed, enrichPosts } from "@/lib/post"
import Link from "next/link"

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const { isAuthenticated, userProfile } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const postsPerPage = 10
  const [hasMore, setHasMore] = useState(false)

  // Theme initialization
  useEffect(() => {
    const theme = localStorage.getItem("theme")
    if (theme === "dark") document.documentElement.classList.add("dark")
    else if (theme === "light") document.documentElement.classList.remove("dark")
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.classList.add("dark")
  }, [])

  // Fetch posts for current page
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const offset = (currentPage - 1) * postsPerPage
        const response = await getHomeFeed(postsPerPage, offset, sortBy)
        if (response && response.documents && response.documents.length > 0) {
          try {
            const enriched = await enrichPosts(response.documents)
            setPosts(enriched)
          } catch (enrichError) {
            console.warn("Failed to enrich posts, showing raw data:", enrichError)
            setPosts(response.documents)
          }
          setTotalPosts(response.total || 0)
          setHasMore(response.documents.length === postsPerPage)
        } else {
          setPosts([])
          setTotalPosts(0)
          setHasMore(false)
        }
      } catch (error: any) {
        console.error("Failed to fetch posts:", error)
        setPosts([])
        setTotalPosts(0)
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [sortBy, currentPage])

  const totalPages = Math.ceil(totalPosts / postsPerPage)

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    try {
      setIsLoading(true)
      const offset = currentPage * postsPerPage
      const response = await getHomeFeed(postsPerPage, offset, sortBy)
      if (response && response.documents && response.documents.length > 0) {
        try {
          const enriched = await enrichPosts(response.documents)
          setPosts((prevPosts) => [...prevPosts, ...enriched])
        } catch (enrichError) {
          console.warn("Failed to enrich posts, showing raw data:", enrichError)
          setPosts((prevPosts) => [...prevPosts, ...response.documents])
        }
        setTotalPosts(response.total || 0)
        setHasMore(response.documents.length === postsPerPage)
      } else {
        setHasMore(false)
      }
    } catch (error: any) {
      console.error("Failed to fetch more posts:", error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <Header
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSignupClick={() => setIsSignupModalOpen(true)}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex relative">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isAuthenticated={isAuthenticated}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
        />

        {/* Main Feed + Right Sidebar */}
        <div className="flex flex-1 gap-4">
          {/* Feed */}
          <main
            className={`flex-1 px-4 transition-[margin] duration-300 ease-in-out ${
              isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
            }`}
          >
            {/* Navigation Tabs */}
            <div className="sticky top-16 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 z-20">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex gap-6">
                  <button className="px-4 py-3 font-semibold text-orange-600 border-b-2 border-orange-600 text-sm">
                    Home
                  </button>
                  <button className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                    Popular
                  </button>
                  <button className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                    All
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-full text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    Best
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-6 py-6">
              {/* Create Post */}
              {isAuthenticated && (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 flex gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                    {userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <Link
                    href="/r/popular/submit?type=TEXT"
                    className="flex-1 text-left text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-4 py-2 rounded-full transition-colors text-sm"
                  >
                    Create a post
                  </Link>
                </div>
              )}

              {/* Sort Options */}
              <SortButtons sortBy={sortBy} onSortChange={setSortBy} />

              {/* Feed */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.$id} post={post} />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-6">
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

              {posts.length === 0 && !isLoading && (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-8 text-center shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to Reddit Clone
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {isAuthenticated
                      ? "No posts yet. Create communities and share your thoughts!"
                      : "Sign up or log in to get started"}
                  </p>
                  {!isAuthenticated && (
                    <button
                      onClick={() => setIsSignupModalOpen(true)}
                      className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold transition-colors"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80 pl-4 py-6">
            <div className="sticky top-28 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Posts</h3>
                <button className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
                  Clear
                </button>
              </div>
              <div className="space-y-3">
                {posts.length > 0 ? (
                  posts.slice(0, 3).map((post) => (
                    <Link
                      key={post.$id}
                      href={`/post/${post.$id}`}
                      className="flex gap-3 group hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-200 dark:bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">📷</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          r/{post.subredditName || "Unknown"}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {post.upvotes || 0} upvotes • {post.commentCount || 0} comments
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-500 text-sm">
                    No posts yet
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />
    </div>
  )
}
