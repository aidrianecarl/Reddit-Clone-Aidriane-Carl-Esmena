"use client"

import type React from "react"

import { useState } from "react"
import { createComment } from "@/lib/comment"
import { updatePostCommentCount } from "@/lib/post"
import { useAuth } from "@/app/providers"

interface CommentFormProps {
  postId: string
  parentCommentId?: string
  onCommentCreated?: () => void
  onCancel?: () => void
  isReply?: boolean
}

export function CommentForm({
  postId,
  parentCommentId,
  onCommentCreated,
  onCancel,
  isReply = false,
}: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { user, isAuthenticated } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user) return

    setIsLoading(true)
    setError("")

    try {
      await createComment(content, user.$id, postId, parentCommentId || null)

      if (!parentCommentId) {
        await updatePostCommentCount(postId, 1)
      }

      setContent("")
      onCommentCreated?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className={`py-3 ${isReply ? "border-l-2 border-gray-300 dark:border-slate-700 pl-3 ml-3" : ""}`}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What are your thoughts?"
        rows={isReply ? 2 : 3}
        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 text-sm transition-colors"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="flex gap-2 mt-2 justify-end">
        {isReply && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-sm disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Posting..." : "Comment"}
        </button>
      </div>
    </form>
  )
}
