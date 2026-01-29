"use client"

import Link from "next/link"
import { MessageCircle, ArrowUp, ArrowDown, Share } from "lucide-react"
import { useState, useEffect } from "react"
import { voteOnPost, getUserVote } from "@/lib/vote"
import { useAuth } from "@/app/providers"

interface PostCardProps {
  post: any
}

export function PostCard({ post }: PostCardProps) {
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const [upvoteCount, setUpvoteCount] = useState(post.upvotes || 0)
  const [downvoteCount, setDownvoteCount] = useState(post.downvotes || 0)
  const [isVoting, setIsVoting] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchUserVote = async () => {
      if (isAuthenticated && user) {
        const vote = await getUserVote(user.$id, post.$id, "post")
        if (vote) {
          setUserVote(vote.voteType as "upvote" | "downvote")
        }
      }
    }

    fetchUserVote()
  }, [isAuthenticated, user, post.$id])

  const handleUpvote = async () => {
    if (!isAuthenticated || !user) return

    setIsVoting(true)
    try {
      const result = await voteOnPost(user.$id, post.$id, "upvote")
      setUpvoteCount(result.upvotes || 0)
      setDownvoteCount(result.downvotes || 0)
      setUserVote(userVote === "upvote" ? null : "upvote")
    } finally {
      setIsVoting(false)
    }
  }

  const handleDownvote = async () => {
    if (!isAuthenticated || !user) return

    setIsVoting(true)
    try {
      const result = await voteOnPost(user.$id, post.$id, "downvote")
      setUpvoteCount(result.upvotes || 0)
      setDownvoteCount(result.downvotes || 0)
      setUserVote(userVote === "downvote" ? null : "downvote")
    } finally {
      setIsVoting(false)
    }
  }

  const netVotes = (post.upvotes || 0) - (post.downvotes || 0)

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      <div className="flex">
        {/* Vote Section */}
        <div className="bg-gray-50 p-3 flex flex-col items-center gap-1 min-w-fit">
          <button
            onClick={handleUpvote}
            disabled={isVoting || !isAuthenticated}
            className={`p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
              userVote === "upvote" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            <ArrowUp size={18} />
          </button>
          <span className="text-xs font-semibold text-gray-900 w-8 text-center">{netVotes}</span>
          <button
            onClick={handleDownvote}
            disabled={isVoting || !isAuthenticated}
            className={`p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 ${
              userVote === "downvote" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <ArrowDown size={18} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <span className="font-semibold text-gray-900">{post.author?.name || "Unknown"}</span>
            <span>•</span>
            <span>
              {post.$createdAt
                ? new Date(post.$createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "Unknown"}
            </span>
          </div>

          {/* Title */}
          <Link href={`/post/${post.$id}`} className="hover:opacity-80">
            <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-3">{post.title}</h3>
          </Link>

          {/* Content Preview */}
          {post.content && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p>}

          {/* Image */}
          {post.imageUrl && (
            <Link href={`/post/${post.$id}`}>
              <img
                src={post.imageUrl || "/placeholder.svg"}
                alt={post.title}
                className="w-full max-h-96 object-cover rounded-lg mb-3"
              />
            </Link>
          )}

          {/* Footer */}
          <div className="flex gap-4 text-gray-600">
            <Link
              href={`/post/${post.$id}`}
              className="flex items-center gap-2 text-xs hover:bg-gray-100 px-3 py-1 rounded transition-colors"
            >
              <MessageCircle size={16} />
              <span>{post.commentCount || 0}</span>
            </Link>
            <button className="flex items-center gap-2 text-xs hover:bg-gray-100 px-3 py-1 rounded transition-colors">
              <Share size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
