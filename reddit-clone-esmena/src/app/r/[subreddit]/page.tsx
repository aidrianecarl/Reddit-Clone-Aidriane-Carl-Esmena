"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { PostCard } from "@/components/post-card"
import { SubredditIconUploadModal } from "@/components/subreddit-icon-upload-modal"
import { getSubredditByName, uploadSubredditIcon, updateSubredditIcon } from "@/lib/subreddit"
import { getPostsBySubreddit, enrichPosts } from "@/lib/post"
import { useAuth } from "@/app/providers"
import { AuthModal } from "@/components/auth-modal"

export default function SubredditPage() {
  const params = useParams()
  const subredditName = params.subreddit as string
  const [subreddit, setSubreddit] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { isAuthenticated, userProfile, user } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isIconModalOpen, setIsIconModalOpen] = useState(false)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const postsPerPage = 10
  const [hasMore, setHasMore] = useState(false)

  const setPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const loadMore = async () => {
    try {
      const offset = currentPage * postsPerPage
      const response = await getPostsBySubreddit(subreddit.$id, postsPerPage, offset, sortBy)
      const enriched = await enrichPosts(response.documents)
      setPosts((prevPosts) => [...prevPosts, ...enriched])
      setTotalPosts(response.total || 0)
      setHasMore(enriched.length > 0)
    } catch (error) {
      console.error("Failed to load more posts:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sr = await getSubredditByName(subredditName)
        setSubreddit(sr)

        if (sr) {
          const offset = (currentPage - 1) * postsPerPage
          const response = await getPostsBySubreddit(sr.$id, postsPerPage, offset, sortBy)
          const enriched = await enrichPosts(response.documents)
          setPosts(enriched)
          setTotalPosts(response.total || 0)
          setHasMore(enriched.length > 0)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [subredditName, sortBy, currentPage])

  const totalPages = Math.ceil(totalPosts / postsPerPage)

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setPage(page)
    }
  }

  const handleIconUpload = async (file: File) => {
    try {
      setIsUploadingIcon(true)
      const iconPath = await uploadSubredditIcon(file)
      
      if (subreddit) {
        await updateSubredditIcon(subreddit.$id, iconPath)
        setSubreddit((prev: any) => ({ ...prev, icon: iconPath }))
      }
    } catch (error) {
      console.error("Failed to upload icon:", error)
    } finally {
      setIsUploadingIcon(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 dark:from-slate-950 to-white dark:to-slate-900">
        <Header onLoginClick={() => setIsLoginModalOpen(true)} onSignupClick={() => setIsSignupModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Loading community...</p>
          </main>
        </div>
      </div>
    )
  }

  if (!subreddit) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 dark:from-slate-950 to-white dark:to-slate-900">
        <Header onLoginClick={() => setIsLoginModalOpen(true)} onSignupClick={() => setIsSignupModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Community not found</p>
              <Link href="/create-subreddit" className="text-blue-600 hover:underline">
                Create this community
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 dark:from-slate-950 to-white dark:to-slate-900">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} onSignupClick={() => setIsSignupModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)} />

        {/* Main Feed + Right Sidebar */}
        <div className="flex flex-1 gap-4">
          {/* Feed */}
          <main className={`flex-1 px-4 py-6 transition-[margin] duration-300 ease-in-out ${
            isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}>
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Subreddit Header */}
              <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-gray-300 dark:from-slate-700 to-gray-400 dark:to-slate-600 flex items-center justify-center relative">
                  <button
                    onClick={() => subreddit?.creatorId === user?.$id && setIsIconModalOpen(true)}
                    className={`w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-6xl font-bold shadow-lg overflow-hidden transition-opacity ${
                      subreddit?.creatorId === user?.$id ? "hover:opacity-80 cursor-pointer" : ""
                    }`}
                  >
                    {subreddit?.icon ? (
                      <img src={subreddit.icon} alt="Community icon" className="w-full h-full object-cover" />
                    ) : (
                      subreddit.name?.charAt(0).toUpperCase()
                    )}
                  </button>
                  {subreddit?.creatorId === user?.$id && (
                    <button
                      onClick={() => setIsIconModalOpen(true)}
                      className="absolute top-4 right-4 w-10 h-10 bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-700 rounded-full flex items-center justify-center text-white"
                    >
                      ✎
                    </button>
                  )}
                </div>
                <div className="px-6 pb-6 pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">r/{subreddit.name}</h1>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">{subreddit.description || "A community"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/r/${subreddit.name}/submit?type=TEXT`} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold transition-colors">
                        Create Post
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                {["newest", "top", "hot"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option)
                      setPage(0)
                    }}
                    className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                      sortBy === option ? "bg-orange-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>

              {/* Posts Feed */}
              {posts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center border border-gray-200 dark:border-slate-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">This community doesn't have any posts yet</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Make one and get this feed started.</p>
                  <Link href={`/r/${subreddit.name}/submit?type=TEXT`} className="inline-block px-8 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold transition-colors">
                    Create Post
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.$id} post={post} />
                    ))}
                  </div>

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
                </>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80 pl-4 py-6">
            <div className="sticky top-20 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Community Info</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="text-center py-4 text-gray-500 dark:text-gray-500">
                  More information coming soon...
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
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <SubredditIconUploadModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onSave={handleIconUpload}
        currentIcon={subreddit?.icon}
        subredditName={subreddit?.name}
      />
    </div>
  )
}
