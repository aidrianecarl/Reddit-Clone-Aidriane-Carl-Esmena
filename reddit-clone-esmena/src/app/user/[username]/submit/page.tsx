"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Suspense } from "react"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  LinkIcon,
  List,
  ListOrdered,
  Eye,
  Clipboard,
  Clock,
  Upload,
  X,
} from "lucide-react"
import { useAuth } from "@/app/providers"
import { createPost } from "@/lib/post"
import { getSubredditByName } from "@/lib/subreddit"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import Loading from "./loading"

type PostType = "TEXT" | "IMAGE" | "LINK"

function SubmitPageContent() {
  const router = useRouter()
  const params = useParams()
  const subredditName = params.subreddit as string

  const { user, userProfile, isAuthenticated } = useAuth()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [subreddit, setSubreddit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [postType, setPostType] = useState<PostType>("TEXT")
  const [error, setError] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showCrosspostModal, setShowCrosspostModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    const fetchSubreddit = async () => {
      try {
        const sr = await getSubredditByName(subredditName)
        if (sr) {
          setSubreddit(sr)
        } else {
          setError("Subreddit not found")
        }
      } catch (err) {
        console.error("Failed to fetch subreddit:", err)
        setError("Failed to load subreddit")
      }
    }

    fetchSubreddit()
  }, [subredditName, isAuthenticated, router])

  // Update URL when post type changes
  useEffect(() => {
    router.push(`/r/${subredditName}/submit?type=${postType}`, { scroll: false })
  }, [postType, subredditName, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (postType === "IMAGE" && !imagePreview) {
      setError("Please upload an image")
      return
    }

    if (postType === "LINK" && !linkUrl.trim()) {
      setError("Please enter a link URL")
      return
    }

    setIsLoading(true)
    try {
      await createPost({
        title,
        content: content || "",
        imageUrl: imagePreview || "",
        subredditId: subreddit.$id,
        authorId: user!.$id,
        postType: postType.toLowerCase(),
      })

      setShowCrosspostModal(true)
    } catch (err: any) {
      setError(err.message || "Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseCrosspostModal = () => {
    setShowCrosspostModal(false)
    router.push(`/r/${subredditName}`)
  }

  const handleCrosspost = () => {
    setShowCrosspostModal(false)
    setTitle("")
    setContent("")
    setImagePreview("")
    setImageFile(null)
    setLinkUrl("")
    setPostType("TEXT")
    router.push(`/r/${subredditName}/submit?type=TEXT`, { scroll: false })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={false} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Please log in to create a post</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />

        <main className="flex-1 max-w-3xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create a post in r/{subredditName}
              </h1>
            </div>

            {/* Post Type Tabs */}
            <div className="flex gap-8 border-b border-gray-200 dark:border-slate-700 mb-6">
              {["TEXT", "IMAGE", "LINK", "POLL", "AMA"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPostType(type as PostType)}
                  className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${
                    postType === type
                      ? "text-blue-600 dark:text-blue-400 border-blue-600"
                      : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {type === "IMAGE" ? "Images & Video" : type}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePost} className="space-y-6">
              {/* Title */}
              <div>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={300}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {title.length}/300
                </div>
              </div>

              {/* Add tags */}
              <div>
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Add tags
                </button>
              </div>

              {/* Image Upload for IMAGE type */}
              {postType === "IMAGE" && (
                <div>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full max-h-96 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("")
                          setImageFile(null)
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 dark:hover:border-slate-600 transition-colors">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-3">
                        <Upload size={32} className="text-gray-400 dark:text-slate-600" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                          Drag and Drop or upload media
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Supported: JPG, PNG, GIF, MP4 (Max 20MB)
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              )}

              {/* Link URL for LINK type */}
              {postType === "LINK" && (
                <input
                  type="url"
                  placeholder="URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {/* Body Content for TEXT and IMAGE types */}
              {(postType === "TEXT" || postType === "IMAGE") && (
                <div>
                  {postType === "IMAGE" && (
                    <div className="mb-4">
                      <label className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-slate-600 transition-colors block">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <Upload size={28} className="text-gray-400 dark:text-slate-600" />
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Drag and Drop or upload media
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Text Editor Toolbar */}
                  <div className="flex items-center gap-1 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-t-lg flex-wrap">
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
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                      title="Code"
                    >
                      <Code size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1" />
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
                    <div className="flex-1" />
                    <button
                      type="button"
                      className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      Switch to Markdown
                    </button>
                  </div>

                  {/* Content Area */}
                  <textarea
                    placeholder="Body text (optional)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 border border-t-0 border-gray-300 dark:border-slate-700 rounded-b-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-48 resize-none"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Clock size={18} />
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-full font-semibold transition-colors"
                  >
                    {isLoading ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Crosspost Modal */}
      {showCrosspostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Get your post the attention it deserves
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Crosspost into other communities and help your post get seen by more people.
            </p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCloseCrosspostModal}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg font-semibold transition-colors"
              >
                Done
              </button>
              <button
                onClick={handleCrosspost}
                className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Crosspost
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}

export default function SubredditSubmitPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SubmitPageContent />
    </Suspense>
  )
}
