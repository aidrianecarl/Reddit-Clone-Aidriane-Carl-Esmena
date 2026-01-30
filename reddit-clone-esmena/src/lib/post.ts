import { databases, DATABASE_ID, POSTS_COLLECTION, USERS_COLLECTION } from "./appwrite"
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
    const queries = [Query.equal("users", authorId), Query.limit(limit), Query.offset(offset)]

    try {
      queries.push(Query.orderDesc("$createdAt"))
    } catch (orderError) {
      console.warn("Could not apply sort order:", orderError)
    }

    const response = await databases.listDocuments(DATABASE_ID, POSTS_COLLECTION, queries)
    return response
  } catch (error) {
    console.error("Failed to fetch user posts:", error)
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
    if (!post.users) {
      console.log("[v0] Post has no users field:", post.$id)
      return post
    }

    const author = await databases.getDocument(DATABASE_ID, USERS_COLLECTION, post.users)
    return {
      ...post,
      author: author || null,
    }
  } catch (error: any) {
    console.log("[v0] Failed to enrich author for post:", post.$id, error.message)
    return post
  }
}

export async function enrichPosts(posts: any[]) {
  return Promise.all(posts.map((post) => enrichPost(post)))
}
