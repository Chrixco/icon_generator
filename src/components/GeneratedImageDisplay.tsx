'use client'

import { useState } from 'react'
import { ImageGenerationResponse } from '@/types/ai'

interface GeneratedImageDisplayProps {
  result: ImageGenerationResponse | null
  onClear: () => void
  onSave: () => void
}

export default function GeneratedImageDisplay({
  result,
  onClear,
  onSave
}: GeneratedImageDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!result || !result.success || !result.imageUrl) {
    return null
  }

  const handleDownload = async () => {
    if (!result.imageUrl) return

    setIsDownloading(true)
    try {
      const response = await fetch(result.imageUrl)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `game-icon-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      onSave()
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (!result.imageUrl) return

    try {
      await navigator.clipboard.writeText(result.imageUrl)
      // Could add a toast notification here
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <div className="bg-gradient-to-br from-cream-50 to-sage-50 rounded-2xl shadow-xl border-2 border-sage-200 p-8 relative">
      {/* Decorative magical elements */}
      <div className="absolute top-4 right-4 text-lg opacity-60 animate-pulse">🌟</div>
      <div className="absolute bottom-4 left-4 text-sm opacity-40 animate-bounce">✨</div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl mr-4 shadow-lg">
            <span className="text-xl">🎨</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-warmwood-800">Your Magical Creation</h3>
            <p className="text-warmwood-600 text-sm">Generated with {result.provider} in {result.generationTime}s</p>
          </div>
        </div>

        <button
          onClick={onClear}
          className="p-2 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all"
          title="Clear result"
        >
          <span className="text-lg">🗑️</span>
        </button>
      </div>

      {/* Image Container */}
      <div className="relative">
        <div className="bg-gradient-to-br from-warmwood-100 to-cream-200 rounded-xl p-4 shadow-inner">
          <div className="relative group">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-cream-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-sage-300 border-t-sage-600 mx-auto mb-3"></div>
                  <p className="text-warmwood-600">Loading your masterpiece...</p>
                </div>
              </div>
            )}

            <img
              src={result.imageUrl}
              alt="Generated game icon"
              className={`w-full max-w-md mx-auto rounded-lg shadow-lg transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />

            {/* Image overlay with info */}
            <div className="absolute inset-0 bg-gradient-to-t from-warmwood-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end">
              <div className="p-4 text-cream-50">
                <p className="text-sm font-medium">Model: {result.model}</p>
                {result.cost && <p className="text-sm">Cost: ~${result.cost}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-center transition-all duration-300 transform ${
              isDownloading
                ? 'bg-sage-300 text-sage-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 hover:from-sage-600 hover:to-sage-700 hover:scale-105 shadow-lg hover:shadow-sage-200'
            }`}
          >
            <div className="flex items-center justify-center">
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-cream-200 border-t-transparent mr-2"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  <span>Download Icon</span>
                </>
              )}
            </div>
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="flex-1 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-warmwood-400 to-warmwood-500 text-cream-50 hover:from-warmwood-500 hover:to-warmwood-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-warmwood-200"
          >
            <div className="flex items-center justify-center">
              <span className="mr-2">📋</span>
              <span>Copy URL</span>
            </div>
          </button>
        </div>

        {/* Generation Info */}
        <div className="mt-6 bg-gradient-to-r from-cream-100 to-sage-50 rounded-lg p-4 border border-sage-200">
          <h4 className="font-medium text-warmwood-800 mb-2 flex items-center">
            <span className="mr-2">📊</span>
            Generation Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-warmwood-600">
            <div>
              <span className="font-medium">Provider:</span> {result.provider}
            </div>
            <div>
              <span className="font-medium">Model:</span> {result.model}
            </div>
            <div>
              <span className="font-medium">Time:</span> {result.generationTime}s
            </div>
            {result.cost && (
              <div>
                <span className="font-medium">Cost:</span> ~${result.cost}
              </div>
            )}
          </div>

          {result.revisedPrompt && (
            <div className="mt-3 pt-3 border-t border-sage-300">
              <span className="font-medium text-warmwood-700">Enhanced Prompt:</span>
              <p className="text-warmwood-600 text-sm mt-1 italic">"{result.revisedPrompt}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}