'use client'

import { useState } from 'react'
import { IconProject, SavedIcon, projectUtils } from '@/utils/projectUtils'

interface ProjectIconGalleryProps {
  project: IconProject | null
  onClose: () => void
  onProjectUpdate?: (project: IconProject) => void
}

export default function ProjectIconGallery({ project, onClose, onProjectUpdate }: ProjectIconGalleryProps) {
  const [showPrompts, setShowPrompts] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<SavedIcon | null>(null)

  if (!project) return null

  const handleDownloadIcon = (icon: SavedIcon) => {
    if (icon.result?.success && icon.result?.imageUrl) {
      const link = document.createElement('a')
      link.href = icon.result.imageUrl
      link.download = `${icon.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDeleteIcon = (iconId: string) => {
    if (confirm('Are you sure you want to delete this icon? This action cannot be undone.')) {
      projectUtils.removeIconFromProject(project!.id, iconId)

      // Update project state
      const updatedProject = projectUtils.getProject(project!.id)
      if (updatedProject && onProjectUpdate) {
        onProjectUpdate(updatedProject)
      }

      // Close detail modal if the deleted icon was selected
      if (selectedIcon?.id === iconId) {
        setSelectedIcon(null)
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="fixed inset-0 bg-warmwood-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-cream-50 to-sage-50 rounded-2xl shadow-2xl border-2 border-sage-200 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-warmwood-400 to-warmwood-600 rounded-xl mr-4 shadow-lg">
              <span className="text-xl">🖼️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-warmwood-800">Icon Gallery</h2>
              <p className="text-warmwood-600 text-sm">{project.name} • {project.icons.length} icons</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Show Prompts Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-warmwood-700">Show Prompts</span>
              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 ${
                  showPrompts
                    ? 'bg-sage-600'
                    : 'bg-warmwood-300'
                }`}
              >
                <span
                  className={`${
                    showPrompts ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {project.icons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sage-200 to-sage-300 rounded-full flex items-center justify-center">
                <span className="text-3xl opacity-60">🎨</span>
              </div>
              <h3 className="text-lg font-medium text-warmwood-800 mb-2">No Icons Yet</h3>
              <p className="text-warmwood-600">Generate your first icon to see it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {project.icons.map((icon) => (
                <div
                  key={icon.id}
                  className="bg-gradient-to-br from-cream-100 to-warmwood-50 rounded-xl border-2 border-warmwood-200 overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedIcon(icon)}
                >
                  {/* Icon Image */}
                  <div className="aspect-square bg-cream-200 relative group">
                    {icon.result?.success && icon.result?.imageUrl ? (
                      <img
                        src={icon.result.imageUrl}
                        alt={icon.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-warmwood-400">
                        <span className="text-4xl">🎨</span>
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-warmwood-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadIcon(icon)
                        }}
                        className="p-2 bg-sage-600 text-cream-50 rounded-lg hover:bg-sage-700 transition-colors"
                        title="Download Icon"
                      >
                        📥
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteIcon(icon.id)
                        }}
                        className="p-2 bg-red-600 text-cream-50 rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete Icon"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Icon Info */}
                  <div className="p-4">
                    <h4 className="font-bold text-warmwood-800 mb-2 truncate">{icon.name}</h4>

                    {showPrompts && (
                      <p className="text-sm text-warmwood-600 mb-3 line-clamp-3 leading-relaxed">
                        {icon.prompt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-warmwood-500">
                      <span className="flex items-center">
                        <span className="mr-1">🤖</span>
                        {icon.provider}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">🕒</span>
                        {formatDate(icon.generatedAt)}
                      </span>
                    </div>

                    {icon.tags && icon.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {icon.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-sage-100 text-sage-700 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {icon.tags.length > 3 && (
                          <span className="px-2 py-1 bg-warmwood-100 text-warmwood-600 text-xs font-medium rounded-full">
                            +{icon.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Icon Detail Modal */}
        {selectedIcon && (
          <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
            <div className="bg-cream-50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-warmwood-800 mb-2">{selectedIcon.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-warmwood-600">
                      <span>🤖 {selectedIcon.provider}</span>
                      <span>🎨 {selectedIcon.model}</span>
                      <span>🕒 {formatDate(selectedIcon.generatedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIcon(null)}
                    className="p-2 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Large Icon Display */}
                  <div className="aspect-square bg-cream-200 rounded-xl overflow-hidden border-2 border-warmwood-200">
                    {selectedIcon.result?.success && selectedIcon.result?.imageUrl ? (
                      <img
                        src={selectedIcon.result.imageUrl}
                        alt={selectedIcon.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-warmwood-400">
                        <span className="text-6xl">🎨</span>
                      </div>
                    )}
                  </div>

                  {/* Icon Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-warmwood-800 mb-3 flex items-center">
                        <span className="mr-2">📜</span>
                        Original Prompt
                      </h4>
                      <p className="text-warmwood-700 bg-warmwood-50 rounded-lg p-4 leading-relaxed">
                        {selectedIcon.prompt}
                      </p>
                    </div>

                    {selectedIcon.tags && selectedIcon.tags.length > 0 && (
                      <div>
                        <h4 className="font-bold text-warmwood-800 mb-3 flex items-center">
                          <span className="mr-2">🏷️</span>
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedIcon.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-sage-100 text-sage-700 font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleDownloadIcon(selectedIcon)}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 transition-all shadow-lg font-medium"
                      >
                        <span className="mr-2">📥</span>
                        Download Icon
                      </button>
                      <button
                        onClick={() => handleDeleteIcon(selectedIcon.id)}
                        className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-cream-50 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-medium"
                      >
                        🗑️
                      </button>
                    </div>
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