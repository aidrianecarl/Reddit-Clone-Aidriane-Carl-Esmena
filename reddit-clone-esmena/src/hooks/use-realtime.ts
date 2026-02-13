import { useEffect, useCallback } from "react"
import { client, DATABASE_ID, POSTS_COLLECTION, COMMENTS_COLLECTION, VOTES_COLLECTION } from "@/lib/appwrite"
import { RealtimeMessage } from "appwrite"

interface UseRealtimeOptions {
  onUpdate?: (message: RealtimeMessage) => void
  onDelete?: (message: RealtimeMessage) => void
  collections?: string[]
}

export function useRealtime({ onUpdate, onDelete, collections = [] }: UseRealtimeOptions) {
  useEffect(() => {
    if (collections.length === 0) return

    // Subscribe to collection updates
    const channels = collections.map((collection) => `databases.${DATABASE_ID}.collections.${collection}.documents`)

    const unsubscribe = client.subscribe(channels, (message: RealtimeMessage) => {
      if (message.events.includes("databases.*.collections.*.documents.*.create") ||
          message.events.includes("databases.*.collections.*.documents.*.update")) {
        onUpdate?.(message)
      }

      if (message.events.includes("databases.*.collections.*.documents.*.delete")) {
        onDelete?.(message)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [collections, onUpdate, onDelete])
}

export function usePostRealtime(postId: string, onVotesUpdate?: (votes: any) => void) {
  const handleUpdate = useCallback(
    (message: RealtimeMessage) => {
      if (message.payload && onVotesUpdate) {
        onVotesUpdate(message.payload)
      }
    },
    [onVotesUpdate]
  )

  useRealtime({
    onUpdate: handleUpdate,
    collections: [VOTES_COLLECTION],
  })
}

export function useCommentRealtime(postId: string, onCommentUpdate?: (comment: any) => void) {
  const handleUpdate = useCallback(
    (message: RealtimeMessage) => {
      if (message.payload && onCommentUpdate) {
        onCommentUpdate(message.payload)
      }
    },
    [onCommentUpdate]
  )

  useRealtime({
    onUpdate: handleUpdate,
    collections: [COMMENTS_COLLECTION],
  })
}
