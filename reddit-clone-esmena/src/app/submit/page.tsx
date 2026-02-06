"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"

export default function SubmitPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/r/popular/submit?type=TEXT")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onLoginClick={() => setIsLoginModalOpen(true)} onSignupClick={() => setIsSignupModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex relative">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)} />
          <div className="flex-1 flex justify-center items-center min-h-[calc(100vh-64px)]">
            <p className="text-gray-600 dark:text-gray-400">Please log in to create a post.</p>
          </div>
        </div>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToSignup={() => {
            setIsLoginModalOpen(false)
            setIsSignupModalOpen(true)
          }}
        />
        <SignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          onSwitchToLogin={() => {
            setIsSignupModalOpen(false)
            setIsLoginModalOpen(true)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} onSignupClick={() => setIsSignupModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)} />
        <div className="flex-1 flex justify-center items-center min-h-[calc(100vh-64px)]">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    </div>
  )
}
