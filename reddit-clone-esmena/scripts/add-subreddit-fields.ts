import { Client, Databases, AttributeType } from "appwrite"

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

const databases = new Databases(client)

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ""
const SUBREDDITS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_SUBREDDITS_COLLECTION_ID || ""

async function addSubredditFields() {
  try {
    console.log("Adding privacyType and topic fields to subreddit_collection...")

    // Add privacyType attribute
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        SUBREDDITS_COLLECTION,
        "privacyType",
        255,
        false,
        "public"
      )
      console.log("✓ Added privacyType field")
    } catch (error: any) {
      if (error.code === 409) {
        console.log("✓ privacyType field already exists")
      } else {
        throw error
      }
    }

    // Add topic attribute
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        SUBREDDITS_COLLECTION,
        "topic",
        255,
        false,
        ""
      )
      console.log("✓ Added topic field")
    } catch (error: any) {
      if (error.code === 409) {
        console.log("✓ topic field already exists")
      } else {
        throw error
      }
    }

    console.log("Migration completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

addSubredditFields()
