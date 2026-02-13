"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Bold, Italic, Strikethrough, Code, LinkIcon, ImageIcon, Smile, List, ListOrdered, Quote, SeparatorVertical as Separator, Code2, Keyboard, MoreHorizontal, X } from "lucide-react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/app/providers"
import { createPost } from "@/lib/post"
import { getAllSubreddits } from "@/lib/subreddit"
import { createPostSchema } from "@/lib/schemas"
import { ZodError } from "zod"

export default function CreatePostPage() {
  const router = useRouter()
  const { user, userProfile, isAuthenticated } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedCommunity, setSelectedCommunity] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [subreddits, setSubreddits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState<"text" | "images" | "link" | "poll">("text")
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    const fetchSubreddits = async () => {
      try {
        const response = await getAllSubreddits(100)
        if (response.documents && response.documents.length > 0) {
          setSubreddits(response.documents)
          setSelectedCommunity(response.documents[0].$id)
        }
      } catch (error) {
        console.error("Failed to fetch subreddits:", error)
        setError("Failed to load communities")
      }
    }

    fetchSubreddits()
  }, [isAuthenticated, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      setImageUrl(data.fileUrl)
      setPreviewImage(data.fileUrl)
    } catch (error: any) {
      setError(error.message || "Failed to upload image")
      console.error("Upload error:", error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setValidationErrors({})

    if (!user?.$id) {
      setError("User ID not found")
      return
    }

    try {
      const postType = activeTab === "images" ? "image" : activeTab === "link" ? "link" : "text"
      
      const validatedData = createPostSchema.parse({
        title,
        content: content || undefined,
        imageUrl: imageUrl || undefined,
        subreddits: selectedCommunity,
        postType,
      })

      setIsLoading(true)

      await createPost({
        title: validatedData.title,
        content: validatedData.content,
        imageUrl: validatedData.imageUrl,
        subredditId: validatedData.subreddits,
        authorId: user.$id,
        postType: validatedData.postType,
      })

      const subredditName = subreddits.find((s) => s.$id === selectedCommunity)?.name
      router.push(`/r/${subredditName}`)
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach((issue: any) => {
          const path = issue.path.join(".")
          errors[path] = issue.message
        })
        setValidationErrors(errors)
        setError("Please check the form for errors")
      } else {
        setError(error.message || "Failed to create post")
      }
      console.error("Create post error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 dark:from-slate-950 to-white dark:to-slate-900">
      <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={false} onToggleCollapse={() => {}} />

        {/* Main Content - flex-1 makes it automatically stretch/shrink with sidebar */}
        <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
          {/* Heading */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create post</h1>
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Drafts
            </button>
          </div>

          {/* Community Selector */}
          <div className="mb-6 relative">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Select a community
              <span className="text-red-500 ml-1">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border ${
                validationErrors.subredditId
                  ? "border-red-500"
                  : "border-gray-200 dark:border-slate-700"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {selectedCommunity ? subreddits.find((s) => s.$id === selectedCommunity)?.name[0].toUpperCase() : "r"}
              </div>
              <span className="flex-1 text-left">
                {selectedCommunity
                  ? `r/${subreddits.find((s) => s.$id === selectedCommunity)?.name}`
                  : "Select a community"}
              </span>
              <ChevronDown size={18} />
            </button>

            {validationErrors.subredditId && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.subredditId}</p>
            )}

            {showCommunityDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 z-50 max-h-64 overflow-y-auto">
                {subreddits.length > 0 ? (
                  subreddits.map((sr) => (
                    <button
                      key={sr.$id}
                      type="button"
                      onClick={() => {
                        setSelectedCommunity(sr.$id)
                        setShowCommunityDropdown(false)
                        setValidationErrors({ ...validationErrors, subredditId: "" })
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
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                    No communities found
                  </div>
                )}
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
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter post title"
                maxLength={300}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all ${
                  validationErrors.title ? "border-red-500" : "border-gray-200 dark:border-slate-700"
                }`}
              />
              {validationErrors.title && <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>}
              <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{title.length}/300</div>
            </div>

            {/* Content or Image based on tab */}
            {activeTab === "text" && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Body text (optional)
                </label>
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-3 flex items-center gap-1 overflow-x-auto">
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="Bold">
                      <Bold size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="Italic">
                      <Italic size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="Strikethrough">
                      <Strikethrough size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Share your thoughts... (optional)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={10000}
                    className="w-full h-48 px-4 py-3 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none"
                  />
                  <div className="bg-gray-50 dark:bg-slate-800 px-4 py-2 text-right text-xs text-gray-500 dark:text-gray-400">
                    {content.length}/10000
                  </div>
                </div>
              </div>
            )}

            {activeTab === "images" && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Image or Video <span className="text-red-500">*</span>
                </label>
                {previewImage ? (
                  <div className="relative w-full">
                    <img src={previewImage || "/placeholder.svg"} alt="Preview" className="w-full max-h-96 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null)
                        setImageUrl("")
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <label className="block mt-3">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          input.click()
                        }}
                        disabled={isUploadingImage}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                      >
                        {isUploadingImage ? "Uploading..." : "Change Image"}
                      </button>
                    </label>
                  </div>
                ) : (
                  <label className="w-full border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-slate-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                    <ImageIcon size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {isUploadingImage ? "Uploading..." : "Drag and drop your image or video here"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF, WebP, MP4, WebM up to 50MB
                    </p>
                  </label>
                )}
                {validationErrors.imageUrl && <p className="text-red-500 text-sm mt-2">{validationErrors.imageUrl}</p>}
              </div>
            )}

            {activeTab === "link" && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Body text (optional)
                </label>
                <textarea
                  placeholder="Add optional context or discussion about the link..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={10000}
                  className="w-full h-32 px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !selectedCommunity || (activeTab === "images" && !imageUrl)}
                className="px-8 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                {isLoading ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </main>

        {/* Right Sidebar - Empty */}
        <aside className="w-80 pl-4 py-6 hidden xl:block"></aside>
      </div>
    </div>
  )
}
