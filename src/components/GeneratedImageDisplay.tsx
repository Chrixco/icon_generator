'use client'

import { useState, useEffect } from 'react'
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
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Handle ESC key and click outside to close fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFullscreen])

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
    <div className="bg-gradient-to-br from-cream-50 to-sage-50 rounded-2xl shadow-xl border-2 border-sage-200 p-8 relative hover:shadow-2xl transition-all duration-500 animate-fade-in-up overflow-hidden group">
      {/* Subtle background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-sage-100/20 via-cream-100/20 to-sunset-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="relative z-10">
      {/* Enhanced Decorative magical elements */}
      <div className="absolute top-4 right-4 text-lg opacity-60 animate-pulse hover:opacity-100 hover:animate-bounce hover:scale-110 transition-all cursor-default">🌟</div>
      <div className="absolute bottom-4 left-4 text-sm opacity-40 animate-bounce hover:opacity-80 hover:animate-pulse transition-opacity cursor-default">✨</div>
      <div className="absolute top-1/2 right-8 text-xs opacity-20 animate-cozy-float">🎨</div>

      <div className="flex items-center justify-between mb-8 animate-fade-in-down" style={{animationDelay: '0.1s'}}>
        <div className="flex items-center">
          <div className="relative group/icon">
            <div className="absolute -inset-1 bg-gradient-to-r from-sage-400 via-sunset-400 to-warmwood-400 rounded-xl blur opacity-50 group-hover/icon:opacity-80 transition duration-300 animate-glow-pulse"></div>
            <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl mr-4 shadow-lg group-hover/icon:shadow-xl transform group-hover/icon:scale-110 transition-all duration-300">
              <span className="text-xl group-hover/icon:animate-gentle-bounce">🎨</span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-warmwood-800">Your Magical Creation</h3>
            <p className="text-warmwood-600 text-sm">Generated with {result.provider} in {result.generationTime}s</p>
          </div>
        </div>

        <button
          onClick={onClear}
          className="p-2 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12"
          title="Clear result"
        >
          <span className="text-lg">🗑️</span>
        </button>
      </div>

      {/* Enhanced Image Container */}
      <div className="relative animate-fade-in-up" style={{animationDelay: '0.2s'}}>
        <div className="bg-gradient-to-br from-warmwood-100 to-cream-200 rounded-xl p-4 shadow-inner hover:shadow-lg transition-all duration-300">
          <div className="relative group/image">
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
              className={`w-full max-w-md mx-auto rounded-lg shadow-lg transition-all duration-500 transform group-hover/image:scale-105 hover:shadow-2xl cursor-pointer ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              onClick={() => setIsFullscreen(true)}
              title="Click to view fullscreen (ESC to close)"
            />

            {/* Enhanced Image overlay with info */}
            <div className="absolute inset-0 bg-gradient-to-t from-warmwood-900/70 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-all duration-500 rounded-lg flex items-end">
              <div className="p-4 text-cream-50 transform translate-y-4 group-hover/image:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-medium flex items-center"><span className="mr-2">🤖</span>Model: {result.model}</p>
                {result.cost && <p className="text-sm flex items-center"><span className="mr-2">💰</span>Cost: ~${result.cost}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-center transition-all duration-500 transform relative overflow-hidden ${
              isDownloading
                ? 'bg-sage-300 text-sage-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 hover:from-sage-600 hover:to-sage-700 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-sage-200 animate-glow-pulse'
            }`}
          >
            <div className="flex items-center justify-center group/download">
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-cream-200 border-t-transparent mr-2 shadow-lg"></div>
                  <span className="animate-pulse">Downloading...</span>
                  <div className="ml-2 flex space-x-1">
                    <div className="w-1 h-1 bg-cream-200 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-cream-200 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-cream-200 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </>
              ) : (
                <>
                  <span className="mr-2 group-hover/download:animate-bounce">💾</span>
                  <span>Download Icon</span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/download:opacity-100 -translate-x-full group-hover/download:translate-x-full transition-transform duration-700"></div>
                </>
              )}
            </div>
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="flex-1 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-warmwood-400 to-warmwood-500 text-cream-50 hover:from-warmwood-500 hover:to-warmwood-600 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-warmwood-200 relative overflow-hidden"
          >
            <div className="flex items-center justify-center group/copy">
              <span className="mr-2 group-hover/copy:animate-bounce">📋</span>
              <span>Copy URL</span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/copy:opacity-100 -translate-x-full group-hover/copy:translate-x-full transition-transform duration-700"></div>
            </div>
          </button>
        </div>

        {/* Enhanced Generation Info */}
        <div className="mt-6 bg-gradient-to-r from-cream-100 to-sage-50 rounded-lg p-4 border border-sage-200 hover:shadow-lg hover:from-cream-200 hover:to-sage-100 transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <h4 className="font-medium text-warmwood-800 mb-2 flex items-center group/details">
            <span className="mr-2 group-hover/details:animate-bounce">📊</span>
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

      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center animate-fade-in-up"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-screen-lg max-h-screen p-4">
            {/* Close button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
              title="Close fullscreen (ESC)"
            >
              <span className="text-xl">✕</span>
            </button>

            {/* ESC hint */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white rounded-lg px-3 py-2 text-sm animate-pulse">
              Press ESC or click outside to close
            </div>

            {/* Fullscreen image */}
            <img
              src={result.imageUrl}
              alt="Generated game icon - Fullscreen"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            />

            {/* Image info overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center"><span className="mr-2">🤖</span>{result.provider} - {result.model}</span>
                  <span className="flex items-center"><span className="mr-2">⏱️</span>{result.generationTime}s</span>
                  {result.cost && <span className="flex items-center"><span className="mr-2">💰</span>${result.cost}</span>}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-sage-600 hover:bg-sage-700 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    {isDownloading ? '⏬ Downloading...' : '💾 Download'}
                  </button>
                  <button
                    onClick={handleCopyToClipboard}
                    className="bg-warmwood-600 hover:bg-warmwood-700 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    📋 Copy URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}