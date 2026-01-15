"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AuthModal } from "@/components/auth-modal"
import { getUserByUsername } from "@/lib/user"
import { useAuth } from "@/app/providers"

export default function UserProfile() {
  const params = useParams()
  const username = params.username as string
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserByUsername(username)
        setUserProfile(profile)
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [username])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Loading profile...</p>
          </main>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-white">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />
          <main className="flex-1 flex items-center justify-center min-h-screen">
            <p className="text-gray-500">User not found</p>
          </main>
        </div>
      </div>
    )
  }

  const avatarInitial = userProfile.name?.[0]?.toUpperCase() || "U"

  return (
    <div className="min-h-screen bg-white">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isAuthenticated={isAuthenticated} />

        <main className="flex-1 max-w-3xl mx-auto px-4 py-6">
          {/* Profile Header */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-400 to-teal-400" />

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-2xl border-4 border-white -mt-10">
                  {avatarInitial}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
              <p className="text-gray-600 mt-2">u/{userProfile.name}</p>

              {userProfile.bio && <p className="text-gray-700 mt-4">{userProfile.bio}</p>}

              <div className="flex gap-6 mt-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900">Member since</p>
                  <p>{new Date(userProfile.$createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Posts Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Posts from {userProfile.name}</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </main>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
