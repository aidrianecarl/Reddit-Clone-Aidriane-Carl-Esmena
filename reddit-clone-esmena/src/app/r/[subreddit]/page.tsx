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
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-purple-400 to-blue-400" />
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between mb-4 -mt-10">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">r/{subreddit.name}</h1>
                  <p className="text-gray-600 mt-2">{subreddit.description || "A community"}</p>
                </div>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold">
                  Join
                </button>
              </div>
              <div className="flex gap-8 text-sm text-gray-600 border-t pt-4">
                <div>
                  <p className="font-semibold text-gray-900">{subreddit.memberCount}</p>
                  <p>Members</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{new Date(subreddit.createdAt).toLocaleDateString()}</p>
                  <p>Created</p>
                </div>
              </div>
            </div>
          </div>

          {/* Create Post */}
          {isAuthenticated && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {userProfile?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <Link
                href={`/r/${subreddit.name}/submit`}
                className="flex-1 text-left text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
              >
                Create a post
              </Link>
            </div>
          )}

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
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h2>
              <p className="text-gray-600">Be the first to post in r/{subreddit.name}!</p>
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
          <div className="sticky top-20 bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-4">About r/{subreddit.name}</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">{subreddit.memberCount}</p>
                <p>Members</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Created {new Date(subreddit.createdAt).toLocaleDateString()}
                </p>
              </div>
              {subreddit.description && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Description</p>
                  <p>{subreddit.description}</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
