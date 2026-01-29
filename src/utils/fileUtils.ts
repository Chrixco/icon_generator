// File management utilities for saving icons locally
import { ImageGenerationResponse } from '@/types/ai'

export interface LocalIcon {
  id: string
  name: string
  prompt: string
  fileName: string
  filePath: string
  provider: string
  model: string
  generatedAt: Date
  cost?: number
  generationTime?: number
  tags?: string[]
}

export const fileUtils = {
  // Generate a safe filename from icon name
  generateFileName: (iconName: string, extension: string = 'png'): string => {
    const safeName = iconName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    return `${safeName}_${timestamp}.${extension}`
  },

  // Download image from URL to local system
  downloadImageToLocal: async (imageUrl: string, fileName: string, projectName: string): Promise<boolean> => {
    try {
      // Fetch the image
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }

      const blob = await response.blob()

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl

      // Structure: ProjectName_Images/filename.png
      const downloadFileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Images/${fileName}`
      link.download = downloadFileName

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      window.URL.revokeObjectURL(downloadUrl)

      return true
    } catch (error) {
      console.error('Failed to download image:', error)
      return false
    }
  },

  // Save icon with automatic file download
  saveIconToFile: async (
    generationResult: ImageGenerationResponse,
    iconName: string,
    prompt: string,
    projectName: string
  ): Promise<LocalIcon | null> => {
    if (!generationResult.success || !generationResult.imageUrl) {
      return null
    }

    const fileName = fileUtils.generateFileName(iconName)
    const success = await fileUtils.downloadImageToLocal(
      generationResult.imageUrl,
      fileName,
      projectName
    )

    if (success) {
      const localIcon: LocalIcon = {
        id: `icon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: iconName,
        prompt,
        fileName,
        filePath: `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Images/${fileName}`,
        provider: generationResult.provider,
        model: generationResult.model,
        generatedAt: new Date(),
        cost: generationResult.cost,
        generationTime: generationResult.generationTime,
        tags: fileUtils.extractTagsFromPrompt(prompt)
      }

      return localIcon
    }

    return null
  },

  // Extract tags from prompt (same logic as projectUtils)
  extractTagsFromPrompt: (prompt: string): string[] => {
    const words = prompt.toLowerCase().split(/\s+/)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must']

    const meaningfulWords = words.filter(word =>
      word.length > 2 &&
      !commonWords.includes(word) &&
      !/^\d+$/.test(word)
    )

    // Take up to 5 most relevant words
    return meaningfulWords.slice(0, 5)
  },

  // Get a preview image URL from file path (for display in gallery)
  getPreviewUrl: (filePath: string): string => {
    // For downloaded files, we'll need to use the original imageUrl
    // This is a placeholder - we'll store the original URL in localStorage
    return '/placeholder-icon.png' // You could add a placeholder image
  }
}