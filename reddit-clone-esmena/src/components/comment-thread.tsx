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
  isReplyingTo?: boolean
}

export function CommentThread({
  comment,
  depth = 0,
  onReplyClick,
  replies = [],
  isLoadingReplies = false,
  isReplyingTo = false,
}: CommentThreadProps) {
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const [upvoteCount, setUpvoteCount] = useState(comment.upvotes || 0)
  const [downvoteCount, setDownvoteCount] = useState(comment.downvotes || 0)
  const [showReplies, setShowReplies] = useState(isReplyingTo || replies.length > 0)
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
  const authorName = comment.author?.name || (typeof comment.users === 'string' ? comment.users : "Unknown User")
  const timeAgo = comment.$createdAt ? getTimeAgo(new Date(comment.$createdAt)) : "Unknown"

  return (
    <div className={`${depth > 0 ? "border-l-2 border-gray-300 dark:border-slate-700 pl-3 ml-3" : ""}`}>
      <div className="py-3">
        {/* User info and time */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-gray-900 dark:text-white text-sm">{authorName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
        </div>

        {/* Comment Text */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap break-words">{comment.content}</p>

        {/* Actions Bar */}
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          {/* Vote buttons */}
          <div className="flex items-center gap-1">
            {/* Upvote */}
            <button
              onClick={handleUpvote}
              disabled={isVoting || !isAuthenticated}
              className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50 ${
                userVote === "upvote" ? "text-orange-600 dark:text-orange-500" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <ArrowUp size={16} />
            </button>

            {/* Vote count in the middle */}
            <span className="font-medium w-5 text-center text-gray-700 dark:text-gray-300">{netVotes}</span>

            {/* Downvote */}
            <button
              onClick={handleDownvote}
              disabled={isVoting || !isAuthenticated}
              className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 ${
                userVote === "downvote" ? "text-blue-600 dark:text-blue-500" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <ArrowDown size={16} />
            </button>
          </div>

          {/* Reply */}
          <button
            onClick={() => onReplyClick?.(comment.$id)}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <MessageCircle size={16} />
            <span className="font-medium">Reply</span>
          </button>

          {/* View Replies */}
          {comment.replyCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
            >
              {showReplies ? "Hide" : "View"} {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Replies */}
        {showReplies && (
          <div className="mt-4 space-y-0">
            {isLoadingReplies ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-2">Loading replies...</p>
            ) : replies.length > 0 ? (
              replies.map((reply) => {
                const replyAuthorName = reply.author?.name || (typeof reply.users === 'string' ? reply.users : "Unknown User")
                return (
                  <div key={reply.$id} className="border-l-2 border-gray-300 dark:border-slate-700 pl-3 ml-3">
                    <div className="py-3">
                      {/* Reply User info and time */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{replyAuthorName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(new Date(reply.$createdAt))}</span>
                      </div>

                      {/* Reply Text */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap break-words">{reply.content}</p>

                      {/* Reply Actions Bar */}
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-gray-500 dark:text-gray-400">
                            <ArrowUp size={16} />
                          </button>
                          <span className="font-medium w-5 text-center text-gray-700 dark:text-gray-300">{(reply.upvotes || 0) - (reply.downvotes || 0)}</span>
                          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-500 dark:text-gray-400">
                            <ArrowDown size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => onReplyClick?.(reply.$id)}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <MessageCircle size={16} />
                          <span className="font-medium">Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-2">No replies yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to calculate time ago
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
