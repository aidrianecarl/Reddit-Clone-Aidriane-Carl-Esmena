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
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Theme initialization
  useEffect(() => {
    const theme = localStorage.getItem("theme")
    if (theme === "dark") document.documentElement.classList.add("dark")
    else if (theme === "light") document.documentElement.classList.remove("dark")
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.classList.add("dark")
  }, [])

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const response = await getHomeFeed(20, 0, sortBy)
        if (response && response.documents && response.documents.length > 0) {
          try {
            const enriched = await enrichPosts(response.documents)
            setPosts(enriched)
          } catch (enrichError) {
            console.warn("Failed to enrich posts, showing raw data:", enrichError)
            setPosts(response.documents)
          }
          setHasMore(response.documents.length === 20)
        } else {
          setPosts([])
          setHasMore(false)
        }
        setPage(0)
      } catch (error: any) {
        console.error("Failed to fetch posts:", error)
        setPosts([])
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [sortBy])

  const loadMore = async () => {
    if (!hasMore || isLoading) return
    try {
      const response = await getHomeFeed(20, (page + 1) * 20, sortBy)
      if (response && response.documents) {
        try {
          const enriched = await enrichPosts(response.documents)
          setPosts([...posts, ...enriched])
        } catch (enrichError) {
          console.warn("Failed to enrich posts, showing raw data:", enrichError)
          setPosts([...posts, ...response.documents])
        }
        setPage(page + 1)
        setHasMore(response.documents.length === 20)
      }
    } catch (error) {
      console.error("Failed to load more posts:", error)
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
            className={`flex-1 px-4 py-6 transition-[margin] duration-300 ease-in-out ${
              isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
            }`}
          >
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Create Post */}
              {isAuthenticated && (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 flex gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {userProfile?.name?.[0]?.toUpperCase() || "U"}
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
              ) : posts.length === 0 ? (
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
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.$id} post={post} />
                  ))}

                  {hasMore && (
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80 pl-4 py-6">
            <div className="sticky top-20 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Popular Communities</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="text-center py-4 text-gray-500 dark:text-gray-500">
                  More communities coming soon...
                </p>
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
