import { account } from "./appwrite"

function generateUsername(): string {
  const adjectives = ["Happy", "Swift", "Bright", "Cool", "Smart", "Quick", "Gentle", "Kind"]
  const nouns = ["Tiger", "Eagle", "Dragon", "Phoenix", "Lion", "Falcon", "Bear", "Wolf"]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 10000)
  return `${adj}${noun}${num}`
}

export async function registerUser(email: string, password: string) {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Registration failed")
    }

    const data = await response.json()
    return { user: data.user, username: data.username }
  } catch (error: any) {
    throw new Error(error.message || "Registration failed")
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password)
    return session
  } catch (error: any) {
    throw new Error(error.message || "Login failed")
  }
}

export async function logoutUser() {
  try {
    await account.deleteSession("current")
  } catch (error: any) {
    throw new Error(error.message || "Logout failed")
  }
}

export async function getCurrentUser() {
  try {
    const user = await account.get()
    return user
  } catch (error) {
    return null
  }
}
