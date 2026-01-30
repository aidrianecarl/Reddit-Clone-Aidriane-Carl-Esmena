import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

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

    // Determine folder based on file type
    const isVideo = file.type.startsWith('video/')
    const folder = isVideo ? 'videos' : 'images'

    // Create public folder path
    const publicPath = join(process.cwd(), 'public', folder)

    // Create directory if it doesn't exist
    await mkdir(publicPath, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const ext = file.name.split('.').pop()
    const filename = `${timestamp}-${randomStr}.${ext}`

    // Write file to disk
    const filepath = join(publicPath, filename)
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    // Return the file URL
    const fileUrl = `/${folder}/${filename}`

    return NextResponse.json(
      {
        success: true,
        fileUrl,
        filename,
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
