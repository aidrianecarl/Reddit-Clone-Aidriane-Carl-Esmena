// app/test-db/page.tsx
import { serverDatabases, DATABASE_ID, USERS_COLLECTION } from "@/lib/appwrite"
import { ID } from "node-appwrite"

export default async function TestDBPage() {
  try {
    // Dummy data to insert
    const doc = await serverDatabases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION,
      ID.unique(),
      {
        name: "TestUser",
        email: "testuser@example.com",
        bio: "This is a test user.",
        avatar: "",
      }
    )

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Appwrite Test Success!</h1>
        <p>Document created:</p>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(doc, null, 2)}</pre>
      </div>
    )
  } catch (error: any) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Appwrite Test Failed!</h1>
        <p>Error:</p>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }
}
