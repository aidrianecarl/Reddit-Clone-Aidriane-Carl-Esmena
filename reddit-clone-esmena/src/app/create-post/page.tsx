"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Bold,
  Italic,
  Strikethrough,
  Code,
  LinkIcon,
  ImageIcon,
  Smile,
  List,
  ListOrdered,
  Quote,
  SeparatorVertical as Separator,
  Code2,
  Keyboard,
  MoreHorizontal,
} from "lucide-react"
import { useAuth } from "@/app/providers"
import { createPost } from "@/lib/post"
import { getAllSubreddits } from "@/lib/subreddit"

export default function CreatePostPage() {
  const router = useRouter()
  const { user, userProfile, isAuthenticated } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedCommunity, setSelectedCommunity] = useState("")
  const [subreddits, setSubreddits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState<"text" | "images" | "link" | "poll">("text")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    const fetchSubreddits = async () => {
      try {
        const response = await getAllSubreddits(100)
        if (response.documents) {
          setSubreddits(response.documents)
          if (response.documents.length > 0) {
            setSelectedCommunity(response.documents[0].$id)
          }
        }
      } catch (error) {
        console.error("Failed to fetch subreddits:", error)
      }
    }

    fetchSubreddits()
  }, [isAuthenticated, router])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!selectedCommunity) {
      setError("Please select a community")
      return
    }

    if (!user?.$id) {
      setError("User ID not found")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await createPost(title, content, "", selectedCommunity, user.$id)
      router.push(`/r/${subreddits.find((s) => s.$id === selectedCommunity)?.name}`)
    } catch (error: any) {
      setError(error.message || "Failed to create post")
      console.error("Create post error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-8">
      {/* Heading */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create post</h1>
        <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          Drafts
        </button>
      </div>

      {/* Community Selector */}
      <div className="mb-6 relative">
        <button
          onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {selectedCommunity ? subreddits.find((s) => s.$id === selectedCommunity)?.name[0].toUpperCase() : "r"}
          </div>
          <span>
            {selectedCommunity
              ? `r/${subreddits.find((s) => s.$id === selectedCommunity)?.name}`
              : "Select a community"}
          </span>
          <ChevronDown size={18} />
        </button>

        {showCommunityDropdown && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 z-50 max-h-64 overflow-y-auto">
            {subreddits.map((sr) => (
              <button
                key={sr.$id}
                onClick={() => {
                  setSelectedCommunity(sr.$id)
                  setShowCommunityDropdown(false)
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {sr.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">r/{sr.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{sr.membersCount || 0} members</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreatePost} className="space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-200 dark:border-slate-800 -mx-4 px-4">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === "text"
                ? "text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === "images"
                ? "text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Images & Video
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === "link"
                ? "text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("poll")}
            className={`pb-3 font-semibold text-sm transition-colors ${
              activeTab === "poll"
                ? "text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Poll
          </button>
        </div>

        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Title"
            maxLength={300}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all"
          />
          <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{title.length}/300</div>
        </div>

        {/* Add Tags */}
        <div>
          <button
            type="button"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Add tags
          </button>
        </div>

        {/* Body Text Editor */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-3 flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Bold"
            >
              <Bold size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Italic"
            >
              <Italic size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Strikethrough"
            >
              <Strikethrough size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-slate-700 mx-1"></div>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Code"
            >
              <Code size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Link"
            >
              <LinkIcon size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Image"
            >
              <ImageIcon size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Emoji"
            >
              <Smile size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-slate-700 mx-1"></div>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Bullet List"
            >
              <List size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Quote"
            >
              <Quote size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Code Block"
            >
              <Code2 size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Keyboard"
            >
              <Keyboard size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Separator"
            >
              <Separator size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1"></div>
            <button
              type="button"
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="More"
            >
              <MoreHorizontal size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Editor */}
          <textarea
            placeholder="Body text (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 px-4 py-3 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full font-semibold transition-colors"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-colors"
          >
            {isLoading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  )
}
