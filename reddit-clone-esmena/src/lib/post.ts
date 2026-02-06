import { databases, DATABASE_ID, POSTS_COLLECTION, USERS_COLLECTION, SUBREDDITS_COLLECTION } from "./appwrite"
import { Query, ID } from "appwrite"

interface CreatePostParams {
  title: string
  content?: string
  imageUrl?: string
  subredditId: string
  authorId: string
  postType?: "text" | "image" | "link"
}

export async function createPost(params: CreatePostParams) {
  try {
    const { title, content = "", imageUrl = "", subredditId, authorId, postType = "text" } = params
    
    const post = await databases.createDocument(DATABASE_ID, POSTS_COLLECTION, ID.unique(), {
      title,
      content: content || "",
      imageUrl: imageUrl || "",
      users: authorId,
      subreddits: subredditId,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      postType,
    })
    return post
  } catch (error: any) {
    throw new Error(error.message || "Failed to create post")
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId)
    return post
  } catch (error) {
    console.error("Failed to fetch post:", error)
    return null
  }
}

export async function getPostsBySubreddit(subredditId: string, limit = 20, offset = 0, sortBy = "newest") {
  try {
    const queries = [Query.equal("subreddits", subredditId), Query.limit(limit), Query.offset(offset)]

    try {
      if (sortBy === "newest") {
        queries.push(Query.orderDesc("$createdAt"))
      } else if (sortBy === "top") {
        queries.push(Query.orderDesc("upvotes"))
      } else if (sortBy === "hot") {
        queries.push(Query.orderDesc("upvotes"))
      }
    } catch (orderError) {
      // If ordering fails, just continue without it
      console.warn("Could not apply sort order:", orderError)
    }

    const response = await databases.listDocuments(DATABASE_ID, POSTS_COLLECTION, queries)
    return response
  } catch (error) {
    console.error("Failed to fetch posts:", error)
    return { documents: [], total: 0 }
  }
}

export async function getHomeFeed(limit = 20, offset = 0, sortBy = "newest") {
  try {
    const queries = [Query.limit(limit), Query.offset(offset)]

    try {
      if (sortBy === "newest") {
        queries.push(Query.orderDesc("$createdAt"))
      } else if (sortBy === "top") {
        queries.push(Query.orderDesc("upvotes"))
      } else if (sortBy === "hot") {
        queries.push(Query.orderDesc("upvotes"))
      }
    } catch (orderError) {
      // If ordering fails, just continue without it
      console.warn("Could not apply sort order:", orderError)
    }

    const response = await databases.listDocuments(DATABASE_ID, POSTS_COLLECTION, queries)
    return response
  } catch (error) {
    console.error("Failed to fetch feed:", error)
    return { documents: [], total: 0 }
  }
}

export async function getPostsByAuthor(authorId: string, limit = 20, offset = 0) {
  try {
    console.log("[v0] getPostsByAuthor called with authorId:", authorId, "limit:", limit, "offset:", offset)
    const queries = [Query.equal("users", authorId), Query.limit(limit), Query.offset(offset)]

    try {
      queries.push(Query.orderDesc("$createdAt"))
    } catch (orderError) {
      console.warn("[v0] Could not apply sort order:", orderError)
    }

    console.log("[v0] Running query with", queries.length, "conditions")
    const response = await databases.listDocuments(DATABASE_ID, POSTS_COLLECTION, queries)
    console.log("[v0] getPostsByAuthor response total:", response.total, "documents:", response.documents?.length)
    return response
  } catch (error) {
    console.error("[v0] Failed to fetch user posts:", error)
    return { documents: [], total: 0 }
  }
}

export async function updatePostCommentCount(postId: string, count: number) {
  try {
    const post = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId)
    await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
      commentCount: (post.commentCount || 0) + count,
    })
  } catch (error) {
    console.error("Failed to update comment count:", error)
  }
}

export async function enrichPost(post: any) {
  try {
    let author = null
    let authorName = "Unknown"
    let subreddit = null
    let subredditName = "Unknown"

    // Fetch author
    if (post.users) {
      try {
        author = await databases.getDocument(DATABASE_ID, USERS_COLLECTION, post.users)
        authorName = author?.name || author?.username || "Unknown"
        console.log("[v0] Successfully fetched author:", authorName)
      } catch (error: any) {
        console.log("[v0] Failed to fetch author:", error.message)
      }
    }

    // Fetch subreddit
    if (post.subreddits) {
      try {
        subreddit = await databases.getDocument(DATABASE_ID, SUBREDDITS_COLLECTION, post.subreddits)
        subredditName = subreddit?.name || "Unknown"
        console.log("[v0] Successfully fetched subreddit:", subredditName)
      } catch (error: any) {
        console.log("[v0] Failed to fetch subreddit:", error.message)
      }
    }

    return {
      ...post,
      author: author || null,
      authorName,
      subreddit: subreddit || null,
      subredditName,
    }
  } catch (error: any) {
    console.log("[v0] Error enriching post:", post.$id, "error:", error.message)
    return {
      ...post,
      authorName: "Unknown",
      subredditName: "Unknown",
    }
  }
}

export async function enrichPosts(posts: any[]) {
  return Promise.all(posts.map((post) => enrichPost(post)))
}
