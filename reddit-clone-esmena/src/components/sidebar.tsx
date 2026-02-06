"use client"

import React from "react"

import Link from "next/link"
import {
  Home,
  Compass,
  Users,
  Plus,
  ChevronDown,
  Zap,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { getAllSubreddits } from "@/lib/subreddit"
import { CreateSubredditModal } from "./create-subreddit-modal"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({
  isOpen,
  onClose,
  isAuthenticated,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [subreddits, setSubreddits] = useState<any[]>([])
  const [isLoadingSubreddits, setIsLoadingSubreddits] = useState(true)
  const [expandCommunities, setExpandCommunities] = useState(true)
  const [expandGames, setExpandGames] = useState(true)
  const [expandResources, setExpandResources] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    const fetchSubreddits = async () => {
      try {
        const res = await getAllSubreddits(10)
        if (res.documents) setSubreddits(res.documents)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingSubreddits(false)
      }
    }

    fetchSubreddits()
  }, [])

  return (
    <>
      <CreateSubredditModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Modal Backdrop - Darkens sidebar and disables interactions */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" />
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          left-0
          top-16
          h-[calc(100vh-64px)]
          bg-white dark:bg-slate-900
          border-r border-gray-200 dark:border-slate-800
          z-50
          overflow-y-auto
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
          ${isCreateModalOpen ? "pointer-events-none opacity-50" : ""}
        `}
      >
        {/* Collapse Button (Desktop) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute right-3 top-4 w-9 h-9 rounded-full bg-white dark:bg-slate-900 border shadow items-center justify-center"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="p-4 space-y-4">
          {/* Primary Nav */}
          <nav className="space-y-1">
            <SidebarLink href="/" icon={<Home size={20} />} label="Home" collapsed={isCollapsed} />
            <SidebarLink href="/popular" icon={<Zap size={20} />} label="Popular" collapsed={isCollapsed} />
            <SidebarLink href="/explore" icon={<Compass size={20} />} label="Explore" collapsed={isCollapsed} />
            <SidebarLink href="/all" icon={<Users size={20} />} label="All" collapsed={isCollapsed} />
          </nav>

          {isAuthenticated && (
            <>
              {/* Create Community */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  <Plus size={20} />
                  {!isCollapsed && "Create Community"}
                </button>
              </div>

              {/* Communities */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setExpandCommunities(!expandCommunities)}
                  className="flex justify-between w-full text-xs font-semibold text-gray-500 px-3 py-2"
                >
                  {!isCollapsed && "YOUR COMMUNITIES"}
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
                      <p className="text-xs px-3">Loading...</p>
                    ) : (
                      subreddits.map((sr) => (
                        <Link
                          key={sr.$id}
                          href={`/r/${sr.name}`}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                            {sr.name[0].toUpperCase()}
                          </div>
                          r/{sr.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Games */}
              <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                <button
                  onClick={() => setExpandGames(!expandGames)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors mb-2"
                >
                  {!isCollapsed && <span>GAMES ON REDDIT</span>}
                  {!isCollapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${expandGames ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {expandGames && !isCollapsed && (
                  <div className="space-y-2">
                    <div className="px-3 py-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Gamepad2 size={16} className="text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Hot and Cold</span>
                        <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
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
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${expandResources ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {expandResources && !isCollapsed && (
                  <div className="space-y-1 text-sm">
                    <Link href="#" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors">About Reddit</Link>
                    <Link href="#" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors">Advertise</Link>
                    <Link href="#" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors">Help Center</Link>
                    <Link href="#" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors">Communities</Link>
                    <Link href="#" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors">Reddit Rules</Link>
                    <Link href="#" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors">Privacy Policy</Link>
                    <Link href="#" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors">User Agreement</Link>
                    <Link href="#" onClick={onClose} className="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors">Accessibility</Link>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!isCollapsed && (
                <div className="border-t border-gray-200 dark:border-slate-800 pt-4 text-xs text-gray-500 dark:text-gray-400">
                  <p>Reddit, Inc. © 2026. All rights reserved.</p>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}

/* Helper for sidebar links */
function SidebarLink({
  href,
  icon,
  label,
  collapsed,
}: {
  href: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
    >
      {icon}
      {!collapsed && label}
    </Link>
  )
}
