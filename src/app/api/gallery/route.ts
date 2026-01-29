import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const imgDirectory = path.join(process.cwd(), 'public', 'img')

    // Check if img directory exists
    try {
      await fs.access(imgDirectory)
    } catch {
      // If directory doesn't exist, create it and return empty array
      await fs.mkdir(imgDirectory, { recursive: true })
      return NextResponse.json([])
    }

    // Read all files from img directory
    const files = await fs.readdir(imgDirectory)

    // Filter for image files only
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return imageExtensions.includes(ext)
    })

    // Get file stats and create image objects
    const images = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(imgDirectory, filename)
        const stats = await fs.stat(filePath)

        return {
          id: filename,
          name: path.parse(filename).name,
          filename,
          url: `/img/${filename}`,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          size: stats.size
        }
      })
    )

    // Sort by creation date, newest first
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error reading gallery images:', error)
    return NextResponse.json(
      { error: 'Failed to read gallery images' },
      { status: 500 }
    )
  }
}