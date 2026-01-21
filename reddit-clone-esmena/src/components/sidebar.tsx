"use client"

import Link from "next/link"
import { Home, Compass, Users, Plus, ChevronDown, Gamepad2, Zap, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { getAllSubreddits } from "@/lib/subreddit"
import { CreateSubredditModal } from "./create-subreddit-modal"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
}

export function Sidebar({ isOpen, onClose, isAuthenticated }: SidebarProps) {
  const [subreddits, setSubreddits] = useState<any[]>([])
  const [isLoadingSubreddits, setIsLoadingSubreddits] = useState(true)
  const [expandCommunities, setExpandCommunities] = useState(true)
  const [expandGames, setExpandGames] = useState(true)
  const [expandResources, setExpandResources] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    const fetchSubreddits = async () => {
      try {
        const response = await getAllSubreddits(10)
        if (response.documents) setSubreddits(response.documents)
      } catch (error) {
        console.error("Failed to fetch subreddits:", error)
        setSubreddits([])
      } finally {
        setIsLoadingSubreddits(false)
      }
    }

    fetchSubreddits()
  }, [])

  return (
    <>
      <CreateSubredditModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-[calc(100vh-64px)] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 overflow-y-auto scrollbar-hide hover:scrollbar-show ${
          isOpen ? "translate-x-0 shadow-lg" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-20 lg:w-20" : "w-64 lg:w-64"}`}
        style={{
          scrollbarWidth: "thin",
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-[22px] top-4 w-10 h-10 bg-white dark:bg-slate-900 rounded-full shadow-lg items-center justify-center border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors z-50 sticky"
          title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Mobile hamburger button */}
        <button
          onClick={onClose}
          className="absolute -right-7 top-4 w-10 h-10 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center border border-gray-200 dark:border-slate-800 lg:hidden"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="p-4 space-y-4">
          {/* Primary Navigation */}
          <nav className="space-y-1">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-medium transition-colors"
            >
              <Home size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>Home</span>}
            </Link>
            <Link
              href="/popular"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-medium transition-colors"
            >
              <Zap size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>Popular</span>}
            </Link>
            <Link
              href="/explore"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-medium transition-colors"
            >
              <Compass size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>Explore</span>}
            </Link>
            <Link
              href="/all"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-medium transition-colors"
            >
              <Users size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>All</span>}
            </Link>
          </nav>

          {isAuthenticated && (
            <>
              {/* Create Community */}
              <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(true)
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-500 font-medium transition-colors"
                >
                  <Plus size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span>Create Community</span>}
                </button>
              </div>

              {/* Communities List */}
              <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                <button
                  onClick={() => setExpandCommunities(!expandCommunities)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors mb-2"
                >
                  {!isCollapsed && <span>YOUR COMMUNITIES</span>}
                  {!isCollapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${expandCommunities ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {expandCommunities && !isCollapsed && (
                  <div className="space-y-1">
                    {isLoadingSubreddits ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">Loading...</p>
                    ) : subreddits.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">No communities yet</p>
                    ) : (
                      subreddits.map((sr) => (
                        <Link
                          key={sr.$id}
                          href={`/r/${sr.name}`}
                          onClick={onClose}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors text-sm"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {sr.name[0].toUpperCase()}
                          </div>
                          <span className="truncate">r/{sr.name}</span>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Games on Reddit */}
          <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
            <button
              onClick={() => setExpandGames(!expandGames)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors mb-2"
            >
              {!isCollapsed && <span>GAMES ON REDDIT</span>}
              {!isCollapsed && (
                <ChevronDown size={16} className={`transition-transform ${expandGames ? "rotate-180" : ""}`} />
              )}
            </button>

            {expandGames && !isCollapsed && (
              <div className="space-y-2">
                <div className="px-3 py-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Gamepad2 size={16} className="text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Hot and Cold</span>
                    <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      NEW
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Guess the word</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1.7M monthly players</p>
                </div>
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
            <button
              onClick={() => setExpandResources(!expandResources)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors mb-2"
            >
              {!isCollapsed && <span>RESOURCES</span>}
              {!isCollapsed && (
                <ChevronDown size={16} className={`transition-transform ${expandResources ? "rotate-180" : ""}`} />
              )}
            </button>

            {expandResources && !isCollapsed && (
              <div className="space-y-1 text-sm">
                <Link
                  href="#"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                >
                  About Reddit
                </Link>
                <Link
                  href="#"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                >
                  Advertise
                </Link>
                <Link
                  href="#"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                >
                  Help Center
                </Link>
                <Link
                  href="#"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                >
                  Communities
                </Link>
                <Link
                  href="#"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                >
                  Reddit Rules
                </Link>
                <Link
                  href="#"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                >
                  User Agreement
                </Link>
                <Link
                  href="#"
                  onClick={onClose}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                >
                  Accessibility
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isCollapsed && (
            <div className="border-t border-gray-200 dark:border-slate-800 pt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>Reddit, Inc. © 2026. All rights reserved.</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
