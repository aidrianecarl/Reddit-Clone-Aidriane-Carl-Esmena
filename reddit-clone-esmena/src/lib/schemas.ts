import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const createSubredditSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(21, "Name must be at most 21 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only alphanumeric characters, underscores, and hyphens allowed"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
})

export const subredditPrivacySchema = z.enum(['public', 'restricted', 'private'])
export const subredditTopicSchema = z.string()

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title must be at most 300 characters"),
  content: z.string().max(10000, "Content must be at most 10000 characters").optional(),
  imageUrl: z.string().optional(),
  subreddits: z.string().min(1, "Please select a community"),
  postType: z.enum(["text", "image", "link"]).optional().default("text"),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(10000, "Comment must be at most 10000 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type CreateSubredditInput = z.infer<typeof createSubredditSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>

export const subredditTypeSchema = z.enum(['public', 'restricted', 'private']).default('public')
