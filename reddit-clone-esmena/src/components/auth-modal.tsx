"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, signupSchema } from "@/lib/schemas"
import { loginUser, registerUser } from "@/lib/auth"
import { useAuth } from "@/app/providers"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  isSignup?: boolean
}

export function AuthModal({ isOpen, onClose, isSignup = false }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"login" | "signup">(isSignup ? "signup" : "login")

  const { refreshUser } = useAuth()

  const schema = mode === "login" ? loginSchema : signupSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError("")

    try {
      if (mode === "login") {
        await loginUser(data.email, data.password)
        await refreshUser()
        onClose()
        reset()
      } else {
        // 1. Register user (API route creates account + DB doc)
        await registerUser(data.email, data.password)

        // 2. Create session immediately
        await loginUser(data.email, data.password)

        // 3. Refresh auth context
        await refreshUser()

        // 4. Close modal
        onClose()
        reset()
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-auto shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === "login" ? "Log In" : "Sign Up"}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-gray-100 rounded-lg"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {String(errors.email.message)}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-gray-100 rounded-lg"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Confirm password"
                className="w-full px-4 py-3 bg-gray-100 rounded-lg"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.confirmPassword.message)}
                </p>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {isLoading
              ? mode === "login"
                ? "Logging in..."
                : "Creating account..."
              : mode === "login"
              ? "Log In"
              : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                onClick={() => {
                  setMode("signup")
                  setError("")
                  reset()
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login")
                  setError("")
                  reset()
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
