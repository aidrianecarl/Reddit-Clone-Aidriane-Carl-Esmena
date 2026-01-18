"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupInput } from "@/lib/schemas"
import { registerUser, loginUser } from "@/lib/auth"
import { useAuth } from "@/app/providers"
import { X, Smartphone, Apple, Mail } from "lucide-react"

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { refreshUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true)
    setError("")

    try {
      await registerUser(data.email, data.password)
      await loginUser(data.email, data.password)
      await refreshUser()
      onClose()
      reset()
    } catch (err: any) {
      setError(err.message || "Sign up failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl relative w-full max-w-md max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Sign Up</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  User Agreement
                </a>{" "}
                and acknowledge that you understand the{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-slate-700" />I agree to
                get emails about cool stuff on Reddit
              </label>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <Smartphone size={20} className="text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Continue With Phone Number</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <Mail size={20} className="text-red-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Continue with Gmail</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <Apple size={20} className="text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Continue With Apple</span>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 border-t border-gray-300 dark:border-slate-700"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">OR</span>
              <div className="flex-1 border-t border-gray-300 dark:border-slate-700"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
              <div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white placeholder:text-gray-500"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>}
              </div>

              <div>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white placeholder:text-gray-500"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{String(errors.password.message)}</p>}
              </div>

              <div>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white placeholder:text-gray-500"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{String(errors.confirmPassword.message)}</p>
                )}
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 rounded-full font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Continue"}
              </button>
            </form>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already a redditor?{" "}
              <button
                onClick={() => {
                  onSwitchToLogin()
                  reset()
                  setError("")
                }}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
