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
