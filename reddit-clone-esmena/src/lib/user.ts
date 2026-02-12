import { databases, DATABASE_ID, USERS_COLLECTION } from "./appwrite"
import { Query } from "appwrite"

export async function getUserProfile(email: string) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION, [Query.equal("email", email)])
    return response.documents[0] || null
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return null
  }
}

export async function getUserByUsername(name: string) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION, [Query.equal("name", name)])
    return response.documents[0] || null
  } catch (error) {
    console.error("Failed to fetch user by name:", error)
    return null
  }
}

export async function updateUserProfile(docId: string, data: any) {
  try {
    const updated = await databases.updateDocument(DATABASE_ID, USERS_COLLECTION, docId, data)
    return updated
  } catch (error) {
    console.error("Failed to update user profile:", error)
    throw error
  }
}

export async function uploadUserAvatar(file: File): Promise<string> {
  try {
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
    
    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", `public/avatar/${filename}`)
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error("Upload failed")
    }
    
    const data = await response.json()
    return data.path || `/public/avatar/${filename}`
  } catch (error) {
    console.error("Failed to upload avatar:", error)
    throw error
  }
}
