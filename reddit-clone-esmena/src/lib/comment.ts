import { databases, DATABASE_ID, COMMENTS_COLLECTION, USERS_COLLECTION } from "./appwrite"
import { Query, ID } from "appwrite"

export async function createComment(
  content: string,
  authorId: string,
  postId: string,
  parentCommentId: string | null = null,
) {
  try {
    const comment = await databases.createDocument(DATABASE_ID, COMMENTS_COLLECTION, ID.unique(), {
      content,
      users: authorId,
      posts: postId,
      parentCommentId: parentCommentId || null,
      upvotes: 0,
      downvotes: 0,
      replyCount: 0,
    })
    return comment
  } catch (error: any) {
    throw new Error(error.message || "Failed to create comment")
  }
}

export async function getCommentsByPost(postId: string, limit = 50, offset = 0) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COMMENTS_COLLECTION, [
      Query.equal("posts", postId),
      Query.isNull("parentCommentId"),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ])
    return response
  } catch (error) {
    console.error("Failed to fetch comments:", error)
    return { documents: [], total: 0 }
  }
}

export async function getReplies(parentCommentId: string) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COMMENTS_COLLECTION, [
      Query.equal("parentCommentId", parentCommentId),
      Query.orderDesc("$createdAt"),
    ])
    return response.documents
  } catch (error) {
    console.error("Failed to fetch replies:", error)
    return []
  }
}

export async function getRepliesWithAuthor(parentCommentId: string) {
  try {
    const replies = await getReplies(parentCommentId)
    return Promise.all(replies.map((reply) => enrichComment(reply)))
  } catch (error) {
    console.error("Failed to fetch enriched replies:", error)
    return []
  }
}

export async function enrichComment(comment: any) {
  try {
    if (!comment.users) {
      console.log("[v0] Comment has no users field:", comment.$id)
      return comment
    }

    const author = await databases.getDocument(DATABASE_ID, USERS_COLLECTION, comment.users)
    return {
      ...comment,
      author: author || null,
    }
  } catch (error: any) {
    console.log("[v0] Failed to enrich comment author:", comment.$id, error.message)
    return comment
  }
}

export async function enrichComments(comments: any[]) {
  return Promise.all(comments.map((comment) => enrichComment(comment)))
}

export async function updateCommentReplyCount(commentId: string, count: number) {
  try {
    const comment = await databases.getDocument(DATABASE_ID, COMMENTS_COLLECTION, commentId)
    await databases.updateDocument(DATABASE_ID, COMMENTS_COLLECTION, commentId, {
      replyCount: (comment.replyCount || 0) + count,
    })
  } catch (error) {
    console.error("Failed to update reply count:", error)
  }
}
