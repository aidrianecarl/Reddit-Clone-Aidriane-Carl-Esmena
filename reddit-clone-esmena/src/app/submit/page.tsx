"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useState } from "react"

export default function SubmitPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/r/popular/submit?type=TEXT")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
          <p className="text-gray-600 dark:text-gray-400">Please log in to create a post.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header onLoginClick={() => {}} onSignupClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
