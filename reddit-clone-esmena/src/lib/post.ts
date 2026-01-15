import { databases, DATABASE_ID, POSTS_COLLECTION, USERS_COLLECTION } from "./appwrite"
import { Query, ID } from "appwrite"

export async function createPost(
  title: string,
  content: string,
  imageUrl: string,
  subredditId: string,
  authorId: string,
) {
  try {
    const post = await databases.createDocument(DATABASE_ID, POSTS_COLLECTION, ID.unique(), {
      title,
      content: content || "",
      imageUrl: imageUrl || "",
      authorId,
      subredditId,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    const queries = [Query.equal("subredditId", subredditId), Query.limit(limit), Query.offset(offset)]

    try {
      if (sortBy === "newest") {
        queries.push(Query.orderDesc("createdAt"))
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
        queries.push(Query.orderDesc("createdAt"))
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
    const queries = [Query.equal("authorId", authorId), Query.limit(limit), Query.offset(offset)]

    try {
      queries.push(Query.orderDesc("createdAt"))
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
    const author = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION, [Query.equal("userId", post.authorId)])
    return {
      ...post,
      author: author.documents[0] || null,
    }
  } catch (error) {
    return post
  }
}

export async function enrichPosts(posts: any[]) {
  return Promise.all(posts.map((post) => enrichPost(post)))
}
