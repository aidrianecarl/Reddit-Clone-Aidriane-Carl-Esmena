import { databases, DATABASE_ID, VOTES_COLLECTION, POSTS_COLLECTION, COMMENTS_COLLECTION } from "./appwrite"
import { Query, ID } from "appwrite"

export async function voteOnPost(userId: string, postId: string, voteType: "upvote" | "downvote") {
  try {
    // Check if user has already voted
    const existingVote = await databases.listDocuments(DATABASE_ID, VOTES_COLLECTION, [
      Query.equal("userId", userId),
      Query.equal("targetId", postId),
      Query.equal("targetType", "post"),
    ])

    const post = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId)
    let newUpvotes = post.upvotes || 0
    let newDownvotes = post.downvotes || 0

    if (existingVote.documents.length > 0) {
      const existingVoteType = existingVote.documents[0].voteType

      // If voting the same way, remove the vote
      if (existingVoteType === voteType) {
        await databases.deleteDocument(DATABASE_ID, VOTES_COLLECTION, existingVote.documents[0].$id)

        if (voteType === "upvote") {
          newUpvotes = Math.max(0, newUpvotes - 1)
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1)
        }
      } else {
        // Change vote type
        await databases.updateDocument(DATABASE_ID, VOTES_COLLECTION, existingVote.documents[0].$id, {
          voteType,
        })

        if (voteType === "upvote") {
          newUpvotes = newUpvotes + 1
          newDownvotes = Math.max(0, newDownvotes - 1)
        } else {
          newDownvotes = newDownvotes + 1
          newUpvotes = Math.max(0, newUpvotes - 1)
        }
      }
    } else {
      // Create new vote
      await databases.createDocument(DATABASE_ID, VOTES_COLLECTION, ID.unique(), {
        userId,
        targetId: postId,
        targetType: "post",
        voteType,
        createdAt: new Date().toISOString(),
      })

      if (voteType === "upvote") {
        newUpvotes = newUpvotes + 1
      } else {
        newDownvotes = newDownvotes + 1
      }
    }

    // Update post vote counts
    await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      updatedAt: new Date().toISOString(),
    })

    return { upvotes: newUpvotes, downvotes: newDownvotes }
  } catch (error: any) {
    console.error("Failed to vote on post:", error)
    throw error
  }
}

export async function voteOnComment(userId: string, commentId: string, voteType: "upvote" | "downvote") {
  try {
    // Check if user has already voted
    const existingVote = await databases.listDocuments(DATABASE_ID, VOTES_COLLECTION, [
      Query.equal("userId", userId),
      Query.equal("targetId", commentId),
      Query.equal("targetType", "comment"),
    ])

    const comment = await databases.getDocument(DATABASE_ID, COMMENTS_COLLECTION, commentId)
    let newUpvotes = comment.upvotes || 0
    let newDownvotes = comment.downvotes || 0

    if (existingVote.documents.length > 0) {
      const existingVoteType = existingVote.documents[0].voteType

      if (existingVoteType === voteType) {
        await databases.deleteDocument(DATABASE_ID, VOTES_COLLECTION, existingVote.documents[0].$id)

        if (voteType === "upvote") {
          newUpvotes = Math.max(0, newUpvotes - 1)
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1)
        }
      } else {
        await databases.updateDocument(DATABASE_ID, VOTES_COLLECTION, existingVote.documents[0].$id, {
          voteType,
        })

        if (voteType === "upvote") {
          newUpvotes = newUpvotes + 1
          newDownvotes = Math.max(0, newDownvotes - 1)
        } else {
          newDownvotes = newDownvotes + 1
          newUpvotes = Math.max(0, newUpvotes - 1)
        }
      }
    } else {
      await databases.createDocument(DATABASE_ID, VOTES_COLLECTION, ID.unique(), {
        userId,
        targetId: commentId,
        targetType: "comment",
        voteType,
        createdAt: new Date().toISOString(),
      })

      if (voteType === "upvote") {
        newUpvotes = newUpvotes + 1
      } else {
        newDownvotes = newDownvotes + 1
      }
    }

    // Update comment vote counts
    await databases.updateDocument(DATABASE_ID, COMMENTS_COLLECTION, commentId, {
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      updatedAt: new Date().toISOString(),
    })

    return { upvotes: newUpvotes, downvotes: newDownvotes }
  } catch (error: any) {
    console.error("Failed to vote on comment:", error)
    throw error
  }
}

export async function getUserVote(userId: string, targetId: string, targetType: "post" | "comment") {
  try {
    const votes = await databases.listDocuments(DATABASE_ID, VOTES_COLLECTION, [
      Query.equal("userId", userId),
      Query.equal("targetId", targetId),
      Query.equal("targetType", targetType),
    ])

    return votes.documents[0] || null
  } catch (error) {
    console.error("Failed to fetch user vote:", error)
    return null
  }
}
