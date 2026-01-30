// lib/appwrite.ts

/**
 * CLIENT‑SIDE APPWRITE SETUP
 * (Browser, React components)
 * -------------------------------------
 */
import { Client, Account, Databases, Storage } from "appwrite"

const appwriteClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

// Client‑side SDK exports (no API key)
export const client = appwriteClient
export const account = new Account(appwriteClient)
export const databases = new Databases(appwriteClient)
export const storage = new Storage(appwriteClient)

/**
 * Export collection ID constants
 * (still safe client‑side because they are public)
 */
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
export const USERS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!
export const SUBREDDITS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_SUBREDDITS_COLLECTION_ID!
export const POSTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID!
export const COMMENTS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!
export const VOTES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_VOTES_COLLECTION_ID!
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!

/**
 * -------------------------------------
 * SERVER‑SIDE APPWRITE SETUP
 * (API routes) – requires node‑appwrite
 * -------------------------------------
 */
import { Client as NodeClient, Account as NodeAccount, Databases as NodeDatabases, Storage as NodeStorage } from "node-appwrite"

const serverClient = new NodeClient()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) // your Appwrite endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!) // project ID
  .setKey(process.env.APPWRITE_API_KEY!) // server API key — required on server only

export const serverAccount = new NodeAccount(serverClient)
export const serverDatabases = new NodeDatabases(serverClient)
export const serverStorage = new NodeStorage(serverClient)
