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

  const netVotes = upvoteCount - downvoteCount
  const authorName = post.author?.name || post.author?.username || "Unknown"
  const timeAgo = post.$createdAt ? getTimeAgo(new Date(post.$createdAt)) : "Unknown"

  return (
    <article className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden hover:shadow-md transition-all duration-150">
      {/* Header with subreddit info and time */}
      <div className="px-4 py-2 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            r
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{authorName} • {timeAgo}</span>
        </div>
        <button className="text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 p-1 rounded">
          <span>⋯</span>
        </button>
      </div>

      {/* Title */}
      <div className="px-4 py-3">
        <Link href={`/post/${post.$id}`} className="hover:opacity-80">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">{post.title}</h3>
        </Link>
      </div>

      {/* Image - Full width, aspect ratio preserved */}
      {post.imageUrl && (
        <Link href={`/post/${post.$id}`} className="block overflow-hidden bg-gray-100 dark:bg-slate-800">
          <img
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-auto object-contain max-h-96"
          />
        </Link>
      )}

      {/* Footer with actions */}
      <div className="px-3 py-2 flex items-center gap-1 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-800">
        {/* Vote section - simplified like Reddit */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpvote}
            disabled={isVoting || !isAuthenticated}
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
            disabled={isVoting || !isAuthenticated}
            className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 ${
              userVote === "downvote" ? "text-blue-600 dark:text-blue-500" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <ArrowDown size={16} />
          </button>
        </div>

        {/* Comment button */}
        <Link
          href={`/post/${post.$id}`}
          className="flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors text-gray-500 dark:text-gray-400"
        >
          <MessageCircle size={16} />
          <span className="text-xs font-medium">{post.commentCount || 0}</span>
        </Link>

        {/* Save button */}
        <button className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400">
          <span className="text-base">⋯</span>
        </button>

        {/* Share button */}
        <Link
          href={`/post/${post.$id}`}
          className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400 ml-auto"
        >
          <Share size={16} />
          <span className="text-xs font-medium">Share</span>
        </Link>
      </div>
    </article>
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
