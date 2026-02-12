import { databases, DATABASE_ID, SUBREDDITS_COLLECTION } from "./appwrite"
import { Query, ID } from "appwrite"

export async function createSubreddit(
  name: string,
  description: string,
  creatorId: string,
  privacyType: 'public' | 'restricted' | 'private' = 'public',
  topic: string = ''
) {
  try {
    const subreddit = await databases.createDocument(DATABASE_ID, SUBREDDITS_COLLECTION, ID.unique(), {
      name: name.toLowerCase(),
      description: description || "",
      creatorId,
      memberCount: 1,
      isPublic: privacyType === 'public',
      privacyType: privacyType,
      topic: topic,
    })
    return subreddit
  } catch (error: any) {
    throw new Error(error.message || "Failed to create subreddit")
  }
}

export async function getSubredditByName(name: string) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, SUBREDDITS_COLLECTION, [
      Query.equal("name", name.toLowerCase()),
    ])
    return response.documents[0] || null
  } catch (error) {
    console.error("Failed to fetch subreddit:", error)
    return null
  }
}

export async function getAllSubreddits(limit = 50, offset = 0) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, SUBREDDITS_COLLECTION, [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("memberCount"),
    ])
    return response
  } catch (error) {
    console.error("Failed to fetch subreddits:", error)
    return { documents: [], total: 0 }
  }
}

export async function joinSubreddit(subredditId: string) {
  try {
    const subreddit = await databases.getDocument(DATABASE_ID, SUBREDDITS_COLLECTION, subredditId)
    await databases.updateDocument(DATABASE_ID, SUBREDDITS_COLLECTION, subredditId, {
      memberCount: (subreddit.memberCount || 0) + 1,
    })
    return true
  } catch (error) {
    console.error("Failed to join subreddit:", error)
    return false
  }
}

export async function leaveSubreddit(subredditId: string) {
  try {
    const subreddit = await databases.getDocument(DATABASE_ID, SUBREDDITS_COLLECTION, subredditId)
    await databases.updateDocument(DATABASE_ID, SUBREDDITS_COLLECTION, subredditId, {
      memberCount: Math.max(0, (subreddit.memberCount || 1) - 1),
    })
    return true
  } catch (error) {
    console.error("Failed to leave subreddit:", error)
    return false
  }
}

export async function getUserSubreddits(userId: string) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, SUBREDDITS_COLLECTION, [
      Query.equal("creatorId", userId),
      Query.orderDesc("$createdAt"),
    ])
    return response.documents || []
  } catch (error) {
    console.error("Failed to fetch user subreddits:", error)
    return []
  }
}

export async function uploadSubredditIcon(file: File): Promise<string> {
  try {
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
    
    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", `public/subreddit/${filename}`)
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error("Upload failed")
    }
    
    const data = await response.json()
    return data.path || `/public/subreddit/${filename}`
  } catch (error) {
    console.error("Failed to upload subreddit icon:", error)
    throw error
  }
}

export async function updateSubredditIcon(subredditId: string, iconPath: string) {
  try {
    const updated = await databases.updateDocument(DATABASE_ID, SUBREDDITS_COLLECTION, subredditId, {
      icon: iconPath,
    })
    return updated
  } catch (error) {
    console.error("Failed to update subreddit icon:", error)
    throw error
  }
}
