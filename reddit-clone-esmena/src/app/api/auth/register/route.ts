// app/api/auth/register/route.ts
import { NextResponse } from "next/server"
import { Client, Databases, Account, ID } from "node-appwrite"

// POST /api/auth/register
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate required env variables
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
    const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID
    const apiKey = process.env.APPWRITE_API_KEY

    if (!endpoint || !projectId || !databaseId || !usersCollectionId || !apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: missing environment variables" },
        { status: 500 }
      )
    }

    // ------------------------
    // Server-side Appwrite client
    // ------------------------
    const client = new Client()
      .setEndpoint(endpoint) // Appwrite endpoint
      .setProject(projectId) // Project ID
      .setKey(apiKey) // Server API key

    const account = new Account(client)
    const databases = new Databases(client)

    // ------------------------
    // Create user in Appwrite Auth
    // ------------------------
    const user = await account.create(ID.unique(), email, password)

    // ------------------------
    // Generate random username
    // ------------------------
    const adjectives = ["Happy", "Swift", "Bright", "Cool", "Smart", "Quick", "Gentle", "Kind"]
    const nouns = ["Tiger", "Eagle", "Dragon", "Phoenix", "Lion", "Falcon", "Bear", "Wolf"]

    const name =
      adjectives[Math.floor(Math.random() * adjectives.length)] +
      nouns[Math.floor(Math.random() * nouns.length)] +
      Math.floor(Math.random() * 10000)

    // ------------------------
    // Create user profile document in database
    // ------------------------
    const userDoc = await databases.createDocument(
      databaseId,
      usersCollectionId,
      ID.unique(),
      {
        name,
        email,
        bio: "",
        avatar: "",
      }
    )

    // ------------------------
    // Return success response
    // ------------------------
    return NextResponse.json(
      {
        success: true,
        user: {
          $id: user.$id,
          email: user.email,
        },
        username: name,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[REGISTER] Error:", error)
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 400 }
    )
  }
}
