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
      authorId,
      postId,
      parentCommentId: parentCommentId || null,
      upvotes: 0,
      downvotes: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return comment
  } catch (error: any) {
    throw new Error(error.message || "Failed to create comment")
  }
}

export async function getCommentsByPost(postId: string, limit = 50, offset = 0) {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COMMENTS_COLLECTION, [
      Query.equal("postId", postId),
      Query.isNull("parentCommentId"),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("createdAt"),
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
      Query.orderDesc("createdAt"),
    ])
    return response.documents
  } catch (error) {
    console.error("Failed to fetch replies:", error)
    return []
  }
}

export async function enrichComment(comment: any) {
  try {
    const author = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION, [
      Query.equal("userId", comment.authorId),
    ])
    return {
      ...comment,
      author: author.documents[0] || null,
    }
  } catch (error) {
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
