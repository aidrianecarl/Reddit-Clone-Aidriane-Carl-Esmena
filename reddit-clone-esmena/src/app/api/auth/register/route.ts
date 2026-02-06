// app/api/auth/register/route.ts
import { NextResponse } from "next/server"
import { Client, Databases, Account, ID } from "node-appwrite"

// POST /api/auth/register
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

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

    // Server Appwrite client
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey)

    const account = new Account(client)
    const databases = new Databases(client)

    // ✅ Create Auth user
    const user = await account.create(ID.unique(), email, password)

    // Generate username
    const adjectives = ["Happy", "Swift", "Bright", "Cool", "Smart", "Quick", "Gentle", "Kind"]
    const nouns = ["Tiger", "Eagle", "Dragon", "Phoenix", "Lion", "Falcon", "Bear", "Wolf"]

    const name =
      adjectives[Math.floor(Math.random() * adjectives.length)] +
      nouns[Math.floor(Math.random() * nouns.length)] +
      Math.floor(Math.random() * 10000)

    // ✅ Create profile with SAME ID as auth user
    await databases.createDocument(
      databaseId,
      usersCollectionId,
      user.$id, // ⭐ CRITICAL FIX
      {
        name,
        email,
        bio: "",
        avatar: "",
      }
    )

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
