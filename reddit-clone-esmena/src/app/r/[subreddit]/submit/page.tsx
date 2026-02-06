"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  X,
  ChevronDown,
  Link2,
  ImageIcon,
} from "lucide-react"
import { useAuth } from "@/app/providers"
import { createPost } from "@/lib/post"
import { getSubredditByName, getUserSubreddits } from "@/lib/subreddit"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

type PostType = "TEXT" | "IMAGE" | "LINK" | "POLL" | "AMA"

export default function SubmitPage() {
  const router = useRouter()
  const params = useParams()
  const subredditName = params.subreddit as string
  const { user, userProfile, isAuthenticated } = useAuth()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [subreddit, setSubreddit] = useState<any>(null)
  const [userCommunities, setUserCommunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [postType, setPostType] = useState<PostType>("TEXT")
  const [error, setError] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false)
  const [showCrosspostModal, setShowCrosspostModal] = useState(false)
  const [createdPost, setCreatedPost] = useState<any>(null)
  const [titleCharCount, setTitleCharCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch subreddit and user communities
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        if (subredditName && subredditName !== "profile") {
          const sr = await getSubredditByName(subredditName)
          if (sr) {
            setSubreddit(sr)
          } else {
            setError("Subreddit not found")
          }
        }

        if (user) {
          const communities = await getUserSubreddits(user.$id)
          setUserCommunities(communities)
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load data")
      }
    }

    fetchData()
  }, [subredditName, isAuthenticated, router, user])

  // Handle URL params for post type
  useEffect(() => {
    const typeParam = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("type")
    if (typeParam && ["TEXT", "IMAGE", "LINK", "POLL", "AMA"].includes(typeParam.toUpperCase())) {
      setPostType(typeParam.toUpperCase() as PostType)
    }
  }, [])

  // Update URL when post type changes
  useEffect(() => {
    if (subredditName && subredditName !== "profile") {
      router.push(`/r/${subredditName}/submit?type=${postType}`, { scroll: false })
    }
  }, [postType, subredditName, router])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCommunityDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
      const post = await createPost({
        title,
        content: postType === "LINK" ? linkUrl : content || "",
        imageUrl: imagePreview || "",
        subredditId: subreddit.$id,
        authorId: user?.$id || "",
        postType: postType.toLowerCase() as "text" | "image" | "link",
      })

      setCreatedPost(post)
      setShowCrosspostModal(true)
    } catch (err: any) {
      setError(err.message || "Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCrosspostClose = () => {
    setShowCrosspostModal(false)
    router.push(`/r/${subredditName}`)
  }

  const handleCrosspost = () => {
    setShowCrosspostModal(false)
    setTitle("")
    setContent("")
    setImagePreview("")
    setLinkUrl("")
    setPostType("TEXT")
    setTitleCharCount(0)
    setError("")
    router.push(`/r/${subredditName}/submit?type=TEXT`, { scroll: false })
  }

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)} />
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
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create post</h1>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex-1">
                {/* Community Selector Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full font-semibold text-sm text-gray-900 dark:text-white transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                      {subreddit?.name?.[0]?.toUpperCase() || "r"}
                    </div>
                    <span>{subreddit ? `r/${subreddit.name}` : "Select a community"}</span>
                    <ChevronDown size={18} />
                  </button>

                  {/* Dropdown Menu */}
                  {showCommunityDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {/* User Communities */}
                      {userCommunities.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800">
                            YOUR COMMUNITIES
                          </div>
                          {userCommunities.map((community) => (
                            <Link
                              key={community.$id}
                              href={`/r/${community.name}/submit?type=${postType}`}
                              onClick={() => setShowCommunityDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-900 dark:text-white"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {community.name[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">r/{community.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{community.description}</p>
                              </div>
                            </Link>
                          ))}
                        </>
                      )}

                      {/* User Profile Option */}
                      <div className="border-t border-gray-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800">
                        YOUR PROFILE
                      </div>
                      {userProfile && (
                        <Link
                          href={`/user/${userProfile?.name}/submit?type=${postType}`}
                          onClick={() => setShowCommunityDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-900 dark:text-white"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {userProfile?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">u/{userProfile?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Your profile</p>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-slate-800 mb-6">
              {(["TEXT", "IMAGE", "LINK", "POLL", "AMA"] as PostType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPostType(tab)}
                  className={`pb-3 font-semibold text-sm transition-colors ${
                    postType === tab
                      ? "text-gray-900 dark:text-white border-b-2 border-blue-600"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab === "IMAGE" ? "Images & Video" : tab === "LINK" ? "Link" : tab}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Title */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Title"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">{titleCharCount}/300</p>
              </div>

              {/* Add Tags */}
              <button type="button" className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                Add tags
              </button>

              {/* Content Area - Different by Type */}
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
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="List">
                      <List size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors" title="Ordered List">
                      <ListOrdered size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Body text (optional)"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-0 focus:outline-none dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-40 resize-none"
                  />
                </div>
              )}

              {postType === "LINK" && (
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Link URL"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              )}

              {/* Error */}
              {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" className="px-6 py-2 bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors">
                  Save Draft
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Crosspost Modal */}
      {showCrosspostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-sm w-full p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Get your post the attention it deserves</h2>
            <p className="text-gray-600 dark:text-gray-400">Crosspost into other communities and help your post get seen by more people.</p>

            <div className="flex gap-3">
              <button
                onClick={handleCrosspostClose}
                className="flex-1 px-6 py-2 bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors"
              >
                Done
              </button>
              <button
                onClick={handleCrosspost}
                className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors"
              >
                Crosspost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
