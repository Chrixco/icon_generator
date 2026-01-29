'use client'

import { useState, useEffect, useCallback } from 'react'
import { GalleryImage } from '@/types/gallery'
import RadialMenu from './RadialMenu'

interface ProjectIconGalleryProps {
  onClose: () => void
}

export default function ProjectIconGallery({ onClose }: ProjectIconGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<GalleryImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [radialMenu, setRadialMenu] = useState<{
    isOpen: boolean
    image: GalleryImage | null
    x: number
    y: number
  }>({ isOpen: false, image: null, x: 0, y: 0 })

  // Fetch images from img folder
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/gallery')

      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }

      const data = await response.json()
      setImages(data)
    } catch (err) {
      console.error('Error fetching gallery images:', err)
      setError(err instanceof Error ? err.message : 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchImages()
  }, [])

  // Handle ESC key to close fullscreen
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (fullscreenImage) {
        setFullscreenImage(null)
      } else {
        onClose()
      }
    }
  }, [fullscreenImage, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [handleEscapeKey])

  const handleDownloadImage = (image: GalleryImage) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleImageRightClick = (e: React.MouseEvent, image: GalleryImage) => {
    e.preventDefault()
    e.stopPropagation()
    setRadialMenu({
      isOpen: true,
      image,
      x: e.clientX,
      y: e.clientY
    })
  }

  const closeRadialMenu = () => {
    setRadialMenu({ isOpen: false, image: null, x: 0, y: 0 })
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-warmwood-900/60 via-sage-900/40 to-cream-900/50 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-cream-50/95 to-sage-50/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-sage-200/50 max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-200/30 bg-gradient-to-r from-cream-100/50 to-sage-100/50 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-warmwood-500 to-warmwood-700 rounded-2xl mr-4 shadow-xl border border-cream-200">
              <span className="text-2xl">🖼️</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-warmwood-800 to-sage-800 bg-clip-text text-transparent">Icon Gallery</h2>
              <p className="text-warmwood-600/80 text-sm font-medium">
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Loading magical icons...
                  </span>
                ) : (
                  `${images.length} beautiful icons awaiting you`
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchImages}
              className="px-4 py-2 bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white rounded-xl transition-all text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span className="mr-2">🔄</span>
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-3 text-warmwood-600 hover:text-white hover:bg-gradient-to-r hover:from-warmwood-500 hover:to-warmwood-600 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-cream-50/30 to-sage-50/30">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sage-200 to-sage-300 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-3xl opacity-60">⏳</span>
              </div>
              <h3 className="text-lg font-medium text-warmwood-800 mb-2">Loading Gallery</h3>
              <p className="text-warmwood-600">Fetching your generated icons...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center">
                <span className="text-3xl opacity-60">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-warmwood-800 mb-2">Error Loading Gallery</h3>
              <p className="text-warmwood-600 mb-4">{error}</p>
              <button
                onClick={fetchImages}
                className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-lg transition-all"
              >
                Try Again
              </button>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sage-200 to-sage-300 rounded-full flex items-center justify-center">
                <span className="text-3xl opacity-60">🎨</span>
              </div>
              <h3 className="text-lg font-medium text-warmwood-800 mb-2">No Icons Yet</h3>
              <p className="text-warmwood-600">Generate your first icon to see it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="bg-gradient-to-br from-cream-100/80 to-warmwood-50/80 backdrop-blur-sm rounded-2xl border border-warmwood-200/50 overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer group"
                  onClick={() => setFullscreenImage(image)}
                  onContextMenu={(e) => handleImageRightClick(e, image)}
                >
                  {/* Image Display */}
                  <div className="aspect-square bg-cream-200/50 relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Modern Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-warmwood-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {/* Action Hint */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 text-white text-sm font-medium text-center">
                          Click to view • Right-click for menu
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-4 right-4 space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadImage(image)
                          }}
                          className="w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
                          title="Quick Download"
                        >
                          📥
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-4 bg-gradient-to-r from-cream-50/90 to-warmwood-50/90 backdrop-blur-sm">
                    <h4 className="font-bold text-warmwood-800 mb-2 truncate" title={image.name}>
                      {image.name}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-warmwood-600">
                      <span className="flex items-center bg-warmwood-100/50 px-2 py-1 rounded-full">
                        <span className="mr-1">📁</span>
                        {formatFileSize(image.size)}
                      </span>
                      <span className="flex items-center bg-sage-100/50 px-2 py-1 rounded-full">
                        <span className="mr-1">🕒</span>
                        {formatDate(image.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Detail Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
            <div className="bg-cream-50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-warmwood-800 mb-2">{selectedImage.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-warmwood-600">
                      <span>📁 {selectedImage.filename}</span>
                      <span>📏 {formatFileSize(selectedImage.size)}</span>
                      <span>🕒 {formatDate(selectedImage.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="p-2 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Large Image Display */}
                  <div
                    className="aspect-square bg-cream-200 rounded-xl overflow-hidden border-2 border-warmwood-200 cursor-pointer"
                    onClick={() => {
                      setSelectedImage(null)
                      setFullscreenImage(selectedImage)
                    }}
                  >
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Image Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-warmwood-800 mb-3 flex items-center">
                        <span className="mr-2">📋</span>
                        File Information
                      </h4>
                      <div className="bg-warmwood-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-warmwood-600">Filename:</span>
                          <span className="font-mono text-warmwood-800">{selectedImage.filename}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-warmwood-600">Size:</span>
                          <span className="font-mono text-warmwood-800">{formatFileSize(selectedImage.size)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-warmwood-600">Created:</span>
                          <span className="font-mono text-warmwood-800">{formatDate(selectedImage.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-warmwood-600">Modified:</span>
                          <span className="font-mono text-warmwood-800">{formatDate(selectedImage.modifiedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDownloadImage(selectedImage)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 transition-all shadow-lg font-medium"
                      >
                        <span className="mr-2">📥</span>
                        Download
                      </button>
                      <button
                        onClick={() => {
                          setSelectedImage(null)
                          setFullscreenImage(selectedImage)
                        }}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-cream-50 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-medium"
                      >
                        <span className="mr-2">🔍</span>
                        Full Screen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-black via-warmwood-900/50 to-sage-900/50 backdrop-blur-xl z-[100] flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          {/* ESC Button */}
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 z-[110] p-4 bg-gradient-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white rounded-2xl backdrop-blur-md transition-all hover:scale-110 border border-white/20"
            title="Close (ESC)"
          >
            <span className="text-2xl font-bold">✕</span>
          </button>

          {/* Action Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleImageRightClick(e, fullscreenImage)
            }}
            className="absolute top-6 left-6 z-[110] p-4 bg-gradient-to-br from-warmwood-500/80 to-warmwood-600/80 hover:from-warmwood-600/90 hover:to-warmwood-700/90 text-white rounded-2xl backdrop-blur-md transition-all hover:scale-110 border border-warmwood-300/30"
            title="Open Actions Menu"
          >
            <span className="text-2xl">⚙️</span>
          </button>

          {/* Image */}
          <div className="max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            <img
              src={fullscreenImage.url}
              alt={fullscreenImage.name}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Image Info */}
          <div className="absolute bottom-6 left-6 z-[110] bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20">
            <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-white to-cream-200 bg-clip-text text-transparent">
              {fullscreenImage.name}
            </h3>
            <p className="text-sm opacity-90 font-medium">
              {formatFileSize(fullscreenImage.size)} • {formatDate(fullscreenImage.createdAt)}
            </p>
          </div>
        </div>
      )}

      {/* Radial Menu */}
      <RadialMenu
        isOpen={radialMenu.isOpen}
        centerIcon="🎨"
        centerLabel="Actions"
        x={radialMenu.x}
        y={radialMenu.y}
        onClose={closeRadialMenu}
        items={[
          {
            icon: "📥",
            label: "Download",
            action: () => radialMenu.image && handleDownloadImage(radialMenu.image),
            color: "bg-gradient-to-br from-sage-500 to-sage-700"
          },
          {
            icon: "🔍",
            label: "Fullscreen",
            action: () => {
              if (radialMenu.image) {
                setFullscreenImage(radialMenu.image)
              }
            },
            color: "bg-gradient-to-br from-blue-500 to-blue-700"
          },
          {
            icon: "📊",
            label: "Details",
            action: () => {
              if (radialMenu.image) {
                setSelectedImage(radialMenu.image)
              }
            },
            color: "bg-gradient-to-br from-purple-500 to-purple-700"
          },
          {
            icon: "🖼️",
            label: "Gallery",
            action: () => {
              // Stay in gallery view
            },
            color: "bg-gradient-to-br from-warmwood-500 to-warmwood-700"
          }
        ]}
      />
    </div>
  )
}