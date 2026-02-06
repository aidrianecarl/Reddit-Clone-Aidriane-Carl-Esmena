"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Bold, Italic, Strikethrough, Code, X, ChevronDown, Link2, ImageIcon } from "lucide-react"
import { useAuth } from "@/app/providers"
import { createPost } from "@/lib/post"
import { getUserSubreddits } from "@/lib/subreddit"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

type PostType = "TEXT" | "IMAGE" | "LINK"

export default function UserSubmitPage() {
  const router = useRouter()
  const params = useParams()
  const username = params.username as string
  const { user, userProfile, isAuthenticated } = useAuth()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [userCommunities, setUserCommunities] = useState<any[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [postType, setPostType] = useState<PostType>("TEXT")
  const [error, setError] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false)
  const [titleCharCount, setTitleCharCount] = useState(0)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (user) {
      const fetchCommunities = async () => {
        try {
          const communities = await getUserSubreddits(user.$id)
          setUserCommunities(communities)
          if (communities.length > 0) {
            setSelectedCommunity(communities[0])
          }
        } catch (err) {
          console.error("Failed to fetch communities:", err)
        }
      }
      fetchCommunities()
    }
  }, [isAuthenticated, user, router])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    if (newTitle.length <= 300) {
      setTitle(newTitle)
      setTitleCharCount(newTitle.length)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
      setImagePreview(data.fileUrl)
    } catch (err: any) {
      setError(err.message || "Failed to upload image")
      console.error("Upload error:", err)
    }
  }

  const handleDragDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith("image/")) return

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
      setImagePreview(data.fileUrl)
    } catch (err: any) {
      setError(err.message || "Failed to upload image")
      console.error("Upload error:", err)
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
        content: postType === "LINK" ? linkUrl : content || "",
        imageUrl: imagePreview || "",
        subredditId: selectedCommunity ? selectedCommunity.$id : "",
        authorId: user?.$id || "",
        postType: postType.toLowerCase() as "text" | "image" | "link",
      })

      router.push(`/user/${username}`)
    } catch (err: any) {
      setError(err.message || "Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={false} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-600 dark:text-gray-400">Please log in to create a post.</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)} />

        <main className={`flex-1 max-w-2xl mx-auto px-4 py-8 transition-[margin] duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create post on your profile</h1>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <button
                    onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full font-semibold text-sm text-gray-900 dark:text-white transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                      {selectedCommunity?.name?.[0]?.toUpperCase() || userProfile?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span>{selectedCommunity ? `r/${selectedCommunity.name}` : `u/${userProfile?.name}`}</span>
                    <ChevronDown size={18} />
                  </button>

                  {showCommunityDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800">
                        YOUR COMMUNITIES
                      </div>
                      {userCommunities.length > 0 ? (
                        userCommunities.map((community) => (
                          <button
                            key={community.$id}
                            onClick={() => {
                              setSelectedCommunity(community)
                              setShowCommunityDropdown(false)
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-900 dark:text-white"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {community.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">r/{community.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{community.description}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No communities joined</div>
                      )}

                      <div className="border-t border-gray-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800">
                        YOUR PROFILE
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCommunity(null)
                          setShowCommunityDropdown(false)
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-900 dark:text-white"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {userProfile?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">u/{userProfile?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Your profile</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
            </div>

            <div className="flex gap-6 border-b border-gray-200 dark:border-slate-800 mb-6">
              {(["TEXT", "IMAGE", "LINK"] as PostType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPostType(tab)}
                  className={`pb-3 font-semibold text-sm transition-colors ${
                    postType === tab
                      ? "text-gray-900 dark:text-white border-b-2 border-orange-600"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab === "IMAGE" ? "Images & Video" : tab === "LINK" ? "Link" : tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Title"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">{titleCharCount}/300</p>
              </div>

              <button type="button" className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                Add tags
              </button>

              {postType === "IMAGE" && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDragDrop}
                  className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 dark:hover:border-slate-600 transition-colors"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-96 mx-auto rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setImagePreview("")}
                        className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={32} className="text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Drag and Drop or upload media</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              )}

              {postType === "TEXT" && (
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="flex gap-1 p-2 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex-wrap">
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="Bold">
                      <Bold size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="Italic">
                      <Italic size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="Strikethrough">
                      <Strikethrough size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="Code">
                      <Code size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="Link">
                      <Link2 size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Text (optional)"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-0 rounded-b-lg focus:outline-none dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-32 resize-none"
                  />
                </div>
              )}

              {postType === "LINK" && (
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              )}

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-full font-semibold transition-colors"
                >
                  {isLoading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
