"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal"
import { CommentForm } from "@/components/comment-form"
import { CommentThread } from "@/components/comment-thread"
import { getPostById, enrichPost } from "@/lib/post"
import { getCommentsByPost, enrichComments, getReplies } from "@/lib/comment"
import { useAuth } from "@/app/providers"
import { voteOnPost, getUserVote } from "@/lib/vote"
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react"

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
          const replies = await getReplies(commentId)
          const enriched = await enrichComments(replies)
          setExpandedReplies((prev) => new Map([...prev, [commentId, enriched]]))
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
      <div className="min-h-screen bg-white">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Loading post...</p>
          </main>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Post not found</p>
          </main>
        </div>
      </div>
    )
  }

  const netVotes = upvoteCount - downvoteCount

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />

        <main className="flex-1 max-w-3xl mx-auto px-4 py-6">
          {/* Post */}
          <article className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="flex">
              <div className="bg-gray-50 p-3 flex flex-col items-center gap-1 min-w-fit">
                <button
                  onClick={handleUpvote}
                  disabled={isVoting}
                  className={`p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
                    userVote === "upvote" ? "text-orange-500" : "text-gray-500"
                  }`}
                >
                  <ArrowUp size={18} />
                </button>
                <span className="text-xs font-semibold text-gray-900 w-8 text-center">{netVotes}</span>
                <button
                  onClick={handleDownvote}
                  disabled={isVoting}
                  className={`p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
                    userVote === "downvote" ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  <ArrowDown size={18} />
                </button>
              </div>

              <div className="flex-1 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full max-h-96 object-cover rounded-lg mb-4"
                  />
                )}

                {post.content && <p className="text-gray-700 mb-6 whitespace-pre-wrap">{post.content}</p>}

                <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
                  <span className="font-semibold text-gray-900">{post.author?.username || "Unknown"}</span>
                  <span>•</span>
                  <span>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Unknown"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    {post.commentCount || 0} Comments
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Comments</h2>

            {/* Comment Form */}
            <div className="mb-6">
              <CommentForm postId={postId} onCommentCreated={handleCommentCreated} />
            </div>

            {/* Comments List */}
            <div className="space-y-0">
              {comments.length === 0 ? (
                <p className="text-gray-600">No comments yet. Be the first to comment!</p>
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
                          const replies = await getReplies(comment.$id)
                          const enriched = await enrichComments(replies)
                          setExpandedReplies((prev) => new Map([...prev, [comment.$id, enriched]]))
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
