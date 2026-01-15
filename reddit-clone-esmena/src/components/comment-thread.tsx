"use client"

import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, MessageCircle } from "lucide-react"
import { voteOnComment, getUserVote } from "@/lib/vote"
import { useAuth } from "@/app/providers"

interface CommentThreadProps {
  comment: any
  depth?: number
  onReplyClick?: (commentId: string) => void
  replies?: any[]
  isLoadingReplies?: boolean
}

export function CommentThread({
  comment,
  depth = 0,
  onReplyClick,
  replies = [],
  isLoadingReplies = false,
}: CommentThreadProps) {
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const [upvoteCount, setUpvoteCount] = useState(comment.upvotes || 0)
  const [downvoteCount, setDownvoteCount] = useState(comment.downvotes || 0)
  const [showReplies, setShowReplies] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchUserVote = async () => {
      if (isAuthenticated && user) {
        const vote = await getUserVote(user.$id, comment.$id, "comment")
        if (vote) {
          setUserVote(vote.voteType as "upvote" | "downvote")
        }
      }
    }

    fetchUserVote()
  }, [isAuthenticated, user, comment.$id])

  const handleUpvote = async () => {
    if (!isAuthenticated || !user) return

    setIsVoting(true)
    try {
      const result = await voteOnComment(user.$id, comment.$id, "upvote")
      setUpvoteCount(result.upvotes)
      setDownvoteCount(result.downvotes)
      setUserVote(userVote === "upvote" ? null : "upvote")
    } finally {
      setIsVoting(false)
    }
  }

  const handleDownvote = async () => {
    if (!isAuthenticated || !user) return

    setIsVoting(true)
    try {
      const result = await voteOnComment(user.$id, comment.$id, "downvote")
      setUpvoteCount(result.upvotes)
      setDownvoteCount(result.downvotes)
      setUserVote(userVote === "downvote" ? null : "downvote")
    } finally {
      setIsVoting(false)
    }
  }

  const netVotes = upvoteCount - downvoteCount

  return (
    <div className={`${depth > 0 ? "pl-4 border-l-2 border-gray-200" : ""}`}>
      <div className="flex gap-3 py-3">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleUpvote}
            disabled={isVoting || !isAuthenticated}
            className={`p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 ${
              userVote === "upvote" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            <ArrowUp size={14} />
          </button>
          <span className="text-xs font-semibold text-gray-900">{netVotes}</span>
          <button
            onClick={handleDownvote}
            disabled={isVoting || !isAuthenticated}
            className={`p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 ${
              userVote === "downvote" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <ArrowDown size={14} />
          </button>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
            <span className="font-semibold text-gray-900">{comment.author?.username || "Unknown"}</span>
            <span>•</span>
            <span>
              {comment.createdAt
                ? new Date(comment.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "Unknown"}
            </span>
          </div>

          {/* Comment Text */}
          <p className="text-sm text-gray-700 mb-2 break-words">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <button
              onClick={() => onReplyClick?.(comment.$id)}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              <MessageCircle size={14} />
              <span>Reply</span>
            </button>
            {comment.replyCount > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showReplies ? "Hide" : `View`} {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {/* Replies */}
          {showReplies && (
            <div className="mt-3 space-y-0">
              {isLoadingReplies ? (
                <p className="text-xs text-gray-500">Loading replies...</p>
              ) : replies.length === 0 ? (
                <p className="text-xs text-gray-500">No replies yet</p>
              ) : (
                replies.map((reply) => (
                  <CommentThread key={reply.$id} comment={reply} depth={depth + 1} onReplyClick={onReplyClick} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
