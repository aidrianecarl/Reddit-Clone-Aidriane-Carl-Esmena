"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal"
import { PostCard } from "@/components/post-card"
import { getSubredditByName } from "@/lib/subreddit"
import { getPostsBySubreddit, enrichPosts } from "@/lib/post"
import { useAuth } from "@/app/providers"

export default function SubredditPage() {
  const params = useParams()
  const subredditName = params.subreddit as string
  const [subreddit, setSubreddit] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const { isAuthenticated, userProfile } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sr = await getSubredditByName(subredditName)
        setSubreddit(sr)

        if (sr) {
          const response = await getPostsBySubreddit(sr.$id, 20, 0, sortBy)
          const enriched = await enrichPosts(response.documents)
          setPosts(enriched)
          setHasMore(response.documents.length === 20)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [subredditName, sortBy])

  const loadMore = async () => {
    if (!subreddit || !hasMore) return

    const response = await getPostsBySubreddit(subreddit.$id, 20, (page + 1) * 20, sortBy)
    const enriched = await enrichPosts(response.documents)
    setPosts([...posts, ...enriched])
    setPage(page + 1)
    setHasMore(response.documents.length === 20)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Loading community...</p>
          </main>
        </div>
      </div>
    )
  }

  if (!subreddit) {
    return (
      <div className="min-h-screen bg-white">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
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
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />

        <main className="flex-1 max-w-3xl mx-auto px-4 py-6">
          {/* Subreddit Header */}
          <div className="bg-white rounded-lg overflow-hidden mb-6">
            <div className="h-40 bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-6xl font-bold shadow-lg">
                {subreddit.name?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute top-4 right-4 w-10 h-10 bg-gray-700 hover:bg-gray-800 rounded-full flex items-center justify-center text-white">
                ✎
              </button>
            </div>
            <div className="px-6 pb-6 pt-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">r/{subreddit.name}</h1>
                  <p className="text-gray-600 mt-2">{subreddit.description || "A community"}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/r/${subreddit.name}/submit?type=TEXT`} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold">
                    + Create Post
                  </Link>
                  <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-semibold">
                    Mod Tools
                  </button>
                  <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
                    ⋯
                  </button>
                </div>
              </div>
            </div>
          </div>



          {/* Sort Options */}
          <div className="mb-4 flex gap-2">
            {["newest", "top", "hot"].map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSortBy(option)
                  setPage(0)
                }}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  sortBy === option ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">This community doesn't have any posts yet</h2>
              <p className="text-gray-600 mb-6">Make one and get this feed started.</p>
              <button className="px-8 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-semibold">
                Create Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.$id} post={post} />
              ))}

              {hasMore && (
                <button
                  onClick={loadMore}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors"
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 pl-4 py-6 hidden xl:block">
          <div className="sticky top-20 bg-white rounded-lg p-6 space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Build your community</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg">
                  <span className="text-2xl">🏆</span>
                  <div className="text-sm">
                    <p className="font-semibold text-white">Finish setting up</p>
                    <p className="text-yellow-100 text-xs">1/3 achievements unlocked</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Create a welcome post</p>
                  <button className="w-full px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-semibold rounded-lg">
                    Create
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Highlight your welcome post</p>
                  <p className="text-gray-600 text-xs">
                    Make the post new members see first
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 mb-4">
                <Link href="#" className="text-blue-600 hover:underline">
                  Join r/NewMods
                </Link>
              </p>
            </div>
          </div>
        </aside>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
