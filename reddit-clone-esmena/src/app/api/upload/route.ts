import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const customPath = formData.get('path') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    let filepath: string
    let fileUrl: string

    if (customPath && customPath.trim()) {
      // Use custom path (e.g., "public/avatar/filename.jpg")
      filepath = join(process.cwd(), customPath)
      fileUrl = `/${customPath.replace(/^public\//, '')}`
    } else {
      // Determine folder based on file type (default behavior)
      const isVideo = file.type.startsWith('video/')
      const folder = isVideo ? 'videos' : 'images'

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(7)
      const ext = file.name.split('.').pop()
      const filename = `${timestamp}-${randomStr}.${ext}`

      filepath = join(process.cwd(), 'public', folder, filename)
      fileUrl = `/${folder}/${filename}`
    }

    // Create directory if it doesn't exist
    const dirPath = dirname(filepath)
    await mkdir(dirPath, { recursive: true })

    // Write file to disk
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    return NextResponse.json(
      {
        success: true,
        path: fileUrl,
        fileUrl,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
