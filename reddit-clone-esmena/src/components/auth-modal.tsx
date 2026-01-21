"use client"

import { useState } from "react"
import { LoginModal } from "./login-modal"
import { SignupModal } from "./signup-modal"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab)

  if (!isOpen) return null

  return (
    <>
      {tab === "login" ? (
        <LoginModal
          isOpen={isOpen}
          onClose={onClose}
          onSwitchToSignup={() => setTab("signup")}
        />
      ) : (
        <SignupModal
          isOpen={isOpen}
          onClose={onClose}
          onSwitchToLogin={() => setTab("login")}
        />
      )}
    </>
  )
}
