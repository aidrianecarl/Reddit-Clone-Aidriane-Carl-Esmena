"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, MessageCircle, Bell, LogOut, Settings, User, Moon, Sun, Plus, MoreHorizontal } from "lucide-react"
import { useAuth } from "@/app/providers"
import { logoutUser } from "@/lib/auth"

interface HeaderProps {
  onLoginClick: () => void
  onSignupClick: () => void
  onMenuClick: () => void
}

export function Header({ onLoginClick, onSignupClick, onMenuClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDark, setIsDark] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, userProfile, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    if (isDarkMode) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      await refreshUser()
      setShowUserMenu(false)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const avatarInitial = userProfile?.name?.[0]?.toUpperCase() || "U"

  return (
    <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} className="text-gray-900 dark:text-white" />
          </button>

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-orange-600">reddit</span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-2xl hidden sm:block">
          <div className="relative group">
            <div className="flex items-center bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-2">
              <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">r</span>
              </div>
              <input
                type="text"
                placeholder="Find anything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 ml-3 bg-transparent text-sm focus:outline-none dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {!isAuthenticated && (
                <button className="ml-2 text-gray-900 dark:text-white text-sm font-semibold hover:text-orange-600">
                  Ask
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg hidden sm:block transition-colors"
                aria-label="Get App"
              >
                <svg
                  className="w-5 h-5 text-gray-900 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg hidden sm:block transition-colors"
                aria-label="Messages"
              >
                <MessageCircle size={20} className="text-gray-900 dark:text-gray-300" />
              </button>

              <Link
                href="/create-post"
                className="hidden sm:flex items-center gap-1 px-4 py-2 text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg font-semibold text-sm transition-colors"
              >
                <Plus size={18} />
                <span>Create</span>
              </Link>

              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg hidden sm:block transition-colors relative"
                aria-label="Notifications"
              >
                <Bell size={20} className="text-gray-900 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-600 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity shadow-sm"
                  aria-label="User menu"
                >
                  {avatarInitial}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-slate-800 py-2 z-50 divide-y divide-gray-100 dark:divide-slate-800">
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>

                    <div className="py-2">
                      <Link
                        href={`/user/${userProfile?.name}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={18} />
                        <span>View Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={toggleDarkMode}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                      </button>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <MoreHorizontal size={20} className="text-gray-900 dark:text-gray-300" />
              </button>
            </>
          ) : (
            <>
              <button className="px-4 py-2 text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full font-semibold text-sm transition-colors hidden sm:block">
                Get App
              </button>

              <button
                onClick={onLoginClick}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold text-sm transition-colors"
              >
                Log In
              </button>

              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <MoreHorizontal size={20} className="text-gray-900 dark:text-gray-300" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
