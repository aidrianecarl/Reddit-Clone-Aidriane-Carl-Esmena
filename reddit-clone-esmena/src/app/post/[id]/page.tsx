"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal"
import { CommentForm } from "@/components/comment-form"
import { CommentThread } from "@/components/comment-thread"
import { getPostById, enrichPost } from "@/lib/post"
import { getCommentsByPost, enrichComments, getRepliesWithAuthor } from "@/lib/comment"
import { useAuth } from "@/app/providers"
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react"
import { getReplies } from "@/lib/reply" // Declaring getReplies variable
import { getUserVote, voteOnPost } from "@/lib/vote" // Declaring getUserVote and voteOnPost variables

export default function PostPage() {
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [downvoteCount, setDownvoteCount] = useState(0)
  const [isVoting, setIsVoting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set())
  const [expandedReplies, setExpandedReplies] = useState<Map<string, any[]>>(new Map())
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const p = await getPostById(postId)
        if (p) {
          const enriched = await enrichPost(p)
          setPost(enriched)
          setUpvoteCount(enriched.upvotes || 0)
          setDownvoteCount(enriched.downvotes || 0)

          if (isAuthenticated && user) {
            const vote = await getUserVote(user.$id, postId, "post")
            if (vote) {
              setUserVote(vote.voteType as "upvote" | "downvote")
            }
          }
        }

        const commentsResponse = await getCommentsByPost(postId)
        const enrichedComments = await enrichComments(commentsResponse.documents)
        setComments(enrichedComments)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [postId, isAuthenticated, user])

  const handleCommentCreated = async () => {
    const commentsResponse = await getCommentsByPost(postId)
    const enrichedComments = await enrichComments(commentsResponse.documents)
    setComments(enrichedComments)
  }

  const handleReplyClick = async (commentId: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }

    if (replyingTo === commentId) {
      setReplyingTo(null)
    } else {
      setReplyingTo(commentId)

      if (!expandedReplies.has(commentId)) {
        setLoadingReplies((prev) => new Set([...prev, commentId]))
        try {
          const enrichedReplies = await getRepliesWithAuthor(commentId)
          setExpandedReplies((prev) => new Map([...prev, [commentId, enrichedReplies]]))
        } finally {
          setLoadingReplies((prev) => {
            const next = new Set(prev)
            next.delete(commentId)
            return next
          })
        }
      }
    }
  }

  const handleUpvote = async () => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true)
      return
    }

    setIsVoting(true)
    try {
      const result = await voteOnPost(user.$id, postId, "upvote")
      setUpvoteCount(result.upvotes)
      setDownvoteCount(result.downvotes)
      setUserVote(userVote === "upvote" ? null : "upvote")
    } finally {
      setIsVoting(false)
    }
  }

  const handleDownvote = async () => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true)
      return
    }

    setIsVoting(true)
    try {
      const result = await voteOnPost(user.$id, postId, "downvote")
      setUpvoteCount(result.upvotes)
      setDownvoteCount(result.downvotes)
      setUserVote(userVote === "downvote" ? null : "downvote")
    } finally {
      setIsVoting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500 dark:text-gray-400">Loading post...</p>
          </main>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500 dark:text-gray-400">Post not found</p>
          </main>
        </div>
      </div>
    )
  }

  const netVotes = upvoteCount - downvoteCount

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />

        <main className="flex-1 max-w-3xl mx-auto px-4 py-6">
          {/* Post */}
          <article className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden mb-6 shadow-sm">
            {/* Post Header */}
            <div className="px-4 py-2 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  r
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {post.author?.name || "Unknown"} • {getTimeAgo(new Date(post.$createdAt))}
                </span>
              </div>
              <button className="text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 p-1 rounded">
                <span>⋯</span>
              </button>
            </div>

            {/* Post Title */}
            <div className="px-4 py-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white leading-snug">{post.title}</h1>
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="bg-gray-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={post.imageUrl || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-auto object-contain max-h-96"
                />
              </div>
            )}

            {/* Post Content */}
            {post.content && (
              <div className="px-4 py-3">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
              </div>
            )}

            {/* Post Actions */}
            <div className="px-3 py-2 flex items-center gap-2 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-800">
              <button
                onClick={handleUpvote}
                disabled={isVoting}
                className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50 ${
                  userVote === "upvote" ? "text-orange-600 dark:text-orange-500" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <ArrowUp size={16} />
              </button>

              {/* Vote count in the middle */}
              <span className="text-xs font-medium w-6 text-center text-gray-700 dark:text-gray-300">{netVotes}</span>

              <button
                onClick={handleDownvote}
                disabled={isVoting}
                className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 ${
                  userVote === "downvote" ? "text-blue-600 dark:text-blue-500" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <ArrowDown size={16} />
              </button>

              <button className="flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                <MessageCircle size={16} />
                <span className="text-xs font-medium">{post.commentCount || 0}</span>
              </button>
            </div>
          </article>

          {/* Comments Section */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Comments</h2>

            {/* Comment Form */}
            <div className="mb-6">
              <CommentForm postId={postId} onCommentCreated={handleCommentCreated} />
            </div>

            {/* Comments List */}
            <div className="space-y-0">
              {comments.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.$id}>
                    <CommentThread
                      comment={comment}
                      onReplyClick={handleReplyClick}
                      replies={expandedReplies.get(comment.$id) || []}
                      isLoadingReplies={loadingReplies.has(comment.$id)}
                    />

                    {replyingTo === comment.$id && (
                      <CommentForm
                        postId={postId}
                        parentCommentId={comment.$id}
                        onCommentCreated={async () => {
                          const enrichedReplies = await getRepliesWithAuthor(comment.$id)
                          setExpandedReplies((prev) => new Map([...prev, [comment.$id, enrichedReplies]]))
                          handleCommentCreated()
                        }}
                        onCancel={() => setReplyingTo(null)}
                        isReply
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
