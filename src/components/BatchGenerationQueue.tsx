'use client'

import { useState, useEffect } from 'react'
import { IconQueueItem, IconProject, projectUtils } from '@/utils/projectUtils'
import { ImageGenerationResponse } from '@/types/ai'
import { GameIconStyle } from './StyleSelector'

interface BatchGenerationQueueProps {
  project: IconProject | null
  onProjectUpdate: (project: IconProject) => void
  onClose: () => void
  selectedStyle?: GameIconStyle | null
  noText?: boolean
  noBackground?: boolean
  monochrome?: boolean
  aspectRatio?: 'square' | 'vertical' | 'horizontal'
  createBackground?: boolean
  getImageSize?: (ratio: 'square' | 'vertical' | 'horizontal') => string
  buildEnhancedPrompt?: (prompt: string) => string
}

export default function BatchGenerationQueue({
  project,
  onProjectUpdate,
  onClose,
  selectedStyle,
  noText = true,
  noBackground = false,
  monochrome = false,
  aspectRatio = 'square',
  createBackground = false,
  getImageSize,
  buildEnhancedPrompt
}: BatchGenerationQueueProps) {
  const [queue, setQueue] = useState<IconQueueItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrompt, setNewItemPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGenerating, setCurrentGenerating] = useState<string | null>(null)

  useEffect(() => {
    if (project && project.generationQueue && Array.isArray(project.generationQueue)) {
      setQueue([...project.generationQueue].sort((a, b) => b.priority - a.priority))
    } else {
      setQueue([])
    }
  }, [project])

  const addToQueue = () => {
    if (!project || !newItemName.trim() || !newItemPrompt.trim()) return

    const newItem = {
      name: newItemName.trim(),
      prompt: newItemPrompt.trim(),
      priority: 1,
      provider: project.settings.defaultProvider,
      model: project.settings.defaultModel,
      quality: project.settings.defaultQuality,
      style: project.settings.defaultStyle,
      useProjectPalette: project.settings.generateWithPalette,
      noText: noText,
      noBackground: noBackground,
      monochrome: monochrome,
      aspectRatio: aspectRatio,
      createBackground: createBackground,
      selectedStyle: selectedStyle
    }

    projectUtils.addToQueue(project.id, newItem)

    // Refresh project data
    const updatedProject = projectUtils.getProject(project.id)
    if (updatedProject) {
      onProjectUpdate(updatedProject)
      setQueue([...updatedProject.generationQueue].sort((a, b) => b.priority - a.priority))
    }

    setNewItemName('')
    setNewItemPrompt('')
  }

  const removeFromQueue = (itemId: string) => {
    if (!project) return

    projectUtils.removeFromQueue(project.id, itemId)

    const updatedProject = projectUtils.getProject(project.id)
    if (updatedProject) {
      onProjectUpdate(updatedProject)
      setQueue([...updatedProject.generationQueue].sort((a, b) => b.priority - a.priority))
    }
  }

  const updatePriority = (itemId: string, priority: number) => {
    if (!project) return

    projectUtils.updateQueueItem(project.id, itemId, { priority })

    const updatedProject = projectUtils.getProject(project.id)
    if (updatedProject) {
      onProjectUpdate(updatedProject)
      setQueue([...updatedProject.generationQueue].sort((a, b) => b.priority - a.priority))
    }
  }

  const generateIcon = async (item: IconQueueItem) => {
    if (!project) return

    setCurrentGenerating(item.id)
    projectUtils.updateQueueItem(project.id, item.id, { status: 'generating' })

    try {
      let finalPrompt = item.prompt

      // Step 1: Apply style injection if available
      if (item.selectedStyle?.promptInjection) {
        finalPrompt = projectUtils.enhancePromptWithStyle(finalPrompt, item.selectedStyle.promptInjection)
      }

      // Step 2: Apply palette enhancement if enabled
      if (item.useProjectPalette && project.colorPalette) {
        finalPrompt = projectUtils.enhancePromptWithPalette(finalPrompt, project.colorPalette)
      }

      // Step 3: Add content type directives
      if (item.createBackground) {
        finalPrompt = `game background, environment art, ${finalPrompt}, detailed game background scene, environment design`
      } else {
        finalPrompt = `game icon, ${finalPrompt}, icon design, game asset`
        if (item.noText) {
          finalPrompt = `${finalPrompt}, no text, no letters, no words, no writing, no typography, pure visual icon only`
        }
      }

      if (item.noBackground && !item.createBackground) {
        finalPrompt = `${finalPrompt}, transparent background, no background, isolated object, PNG with transparency, clean cutout, alpha channel`
      }

      if (item.monochrome) {
        finalPrompt = `${finalPrompt}, monochrome, black and white only, pure black icon on white background, high contrast, simple silhouette style, minimal color palette, black (#000000) and white (#FFFFFF) only`
      }

      // Step 4: Add aspect ratio directives
      if (item.aspectRatio === 'vertical') {
        finalPrompt = `${finalPrompt}, vertical composition, portrait orientation, taller than wide, 9:16 aspect ratio`
      } else if (item.aspectRatio === 'horizontal') {
        finalPrompt = `${finalPrompt}, horizontal composition, landscape orientation, wider than tall, 16:9 aspect ratio`
      } else {
        finalPrompt = `${finalPrompt}, square composition, 1:1 aspect ratio, centered design`
      }

      const requestBody = {
        prompt: finalPrompt,
        provider: item.provider,
        model: item.model,
        quality: item.quality,
        style: item.style,
        size: getImageSize ? getImageSize(item.aspectRatio) : '1024x1024'
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image')
      }

      // Update queue item with success
      projectUtils.updateQueueItem(project.id, item.id, {
        status: 'completed',
        result: result
      })

      // Add to project icons
      projectUtils.addIconToProject(project.id, result, finalPrompt, item.name)

    } catch (error) {
      console.error('Generation error:', error)
      projectUtils.updateQueueItem(project.id, item.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setCurrentGenerating(null)

      // Refresh project
      const updatedProject = projectUtils.getProject(project.id)
      if (updatedProject) {
        onProjectUpdate(updatedProject)
        setQueue([...updatedProject.generationQueue].sort((a, b) => b.priority - a.priority))
      }
    }
  }

  const generateAll = async () => {
    if (!project) return

    setIsGenerating(true)
    const pendingItems = queue.filter(item => item.status === 'pending')

    for (const item of pendingItems) {
      await generateIcon(item)
      // Small delay between generations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setIsGenerating(false)
  }

  const clearCompleted = () => {
    if (!project) return

    projectUtils.clearCompletedQueue(project.id)

    const updatedProject = projectUtils.getProject(project.id)
    if (updatedProject) {
      onProjectUpdate(updatedProject)
      setQueue([...updatedProject.generationQueue].sort((a, b) => b.priority - a.priority))
    }
  }

  const getStatusIcon = (status: IconQueueItem['status']) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'generating': return '🔄'
      case 'completed': return '✅'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const getStatusColor = (status: IconQueueItem['status']) => {
    switch (status) {
      case 'pending': return 'text-warmwood-600 bg-warmwood-100'
      case 'generating': return 'text-sage-600 bg-sage-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const pendingCount = queue.filter(item => item.status === 'pending').length
  const completedCount = queue.filter(item => item.status === 'completed').length
  const failedCount = queue.filter(item => item.status === 'failed').length

  return (
    <div className="fixed inset-0 bg-warmwood-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-cream-50 to-sage-50 rounded-2xl shadow-2xl border-2 border-sage-200 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sunset-400 to-sunset-600 rounded-xl mr-4 shadow-lg">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-warmwood-800">Batch Generation Queue</h2>
              <p className="text-warmwood-600 text-sm">Generate multiple icons in one go</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div className="p-6">
          {/* Queue Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-warmwood-100 to-warmwood-200 p-4 rounded-xl">
              <div className="text-2xl font-bold text-warmwood-800">{queue.length}</div>
              <div className="text-sm text-warmwood-600">Total Items</div>
            </div>
            <div className="bg-gradient-to-br from-sage-100 to-sage-200 p-4 rounded-xl">
              <div className="text-2xl font-bold text-sage-800">{pendingCount}</div>
              <div className="text-sm text-sage-600">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-800">{completedCount}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-xl">
              <div className="text-2xl font-bold text-red-800">{failedCount}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>

          {/* Add New Item */}
          <div className="bg-gradient-to-r from-cream-100 to-sage-100 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-warmwood-800 mb-4 flex items-center">
              <span className="mr-2">➕</span>
              Add to Queue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-warmwood-700 mb-2">Icon Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-3 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50"
                  placeholder="Fire Sword Icon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmwood-700 mb-2">Priority</label>
                <select className="w-full p-3 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50">
                  <option value="1">Normal</option>
                  <option value="2">High</option>
                  <option value="3">Urgent</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-warmwood-700 mb-2">Prompt</label>
              <textarea
                value={newItemPrompt}
                onChange={(e) => setNewItemPrompt(e.target.value)}
                className="w-full p-3 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50 h-24 resize-none"
                placeholder="A magical flaming sword with intricate runes, fantasy RPG style..."
              />
            </div>
            {/* Current Settings Preview */}
            <div className="mb-4 p-3 bg-gradient-to-r from-sage-50 to-emerald-50 rounded-lg border border-sage-200">
              <div className="flex items-center mb-2">
                <span className="mr-2 text-sm">⚙️</span>
                <span className="text-sm font-medium text-sage-800">Current Settings (will be applied to queue item):</span>
              </div>
              <div className="flex items-center text-xs text-sage-700 space-x-4 flex-wrap">
                {createBackground ? <span>🌄 Background mode</span> : <span>🎨 Icon mode</span>}
                <span>📐 {aspectRatio.charAt(0).toUpperCase() + aspectRatio.slice(1)}</span>
                {project?.settings?.generateWithPalette && <span>🎨 Using project palette</span>}
                {selectedStyle && <span>🖌️ {selectedStyle.name}</span>}
                {noText && !createBackground && <span>🚫 No text</span>}
                {noBackground && !createBackground && <span>🔳 Transparent</span>}
                {monochrome && <span>⚫ Monochrome</span>}
              </div>
            </div>

            <button
              onClick={addToQueue}
              disabled={!newItemName.trim() || !newItemPrompt.trim()}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 disabled:from-warmwood-300 disabled:to-warmwood-400 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <span className="mr-2">➕</span>
              Add to Queue
            </button>
          </div>

          {/* Queue Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={generateAll}
              disabled={isGenerating || pendingCount === 0}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-sunset-500 to-sunset-600 text-cream-50 rounded-lg hover:from-sunset-600 hover:to-sunset-700 disabled:from-warmwood-300 disabled:to-warmwood-400 disabled:cursor-not-allowed transition-all shadow-lg font-medium"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-cream-200 border-t-transparent mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  Generate All ({pendingCount})
                </>
              )}
            </button>

            <button
              onClick={clearCompleted}
              disabled={completedCount === 0 && failedCount === 0}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-warmwood-400 to-warmwood-500 text-cream-50 rounded-lg hover:from-warmwood-500 hover:to-warmwood-600 disabled:from-warmwood-300 disabled:to-warmwood-400 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <span className="mr-2">🧹</span>
              Clear Completed
            </button>
          </div>

          {/* Queue List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-warmwood-800 flex items-center">
              <span className="mr-2">📋</span>
              Queue ({queue.length} items)
            </h3>

            {queue.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sage-200 to-sage-300 rounded-full flex items-center justify-center">
                  <span className="text-3xl opacity-60">⚡</span>
                </div>
                <h4 className="text-lg font-medium text-warmwood-800 mb-2">No Items in Queue</h4>
                <p className="text-warmwood-600">Add some icons to generate in batch!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      currentGenerating === item.id
                        ? 'border-sage-400 bg-sage-50 shadow-lg'
                        : item.status === 'completed'
                        ? 'border-green-300 bg-green-50'
                        : item.status === 'failed'
                        ? 'border-red-300 bg-red-50'
                        : 'border-cream-300 bg-cream-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{getStatusIcon(item.status)}</span>
                          <h4 className="font-bold text-warmwood-800">{item.name}</h4>
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          {item.priority > 1 && (
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-sunset-100 text-sunset-700">
                              Priority {item.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-warmwood-600 text-sm mb-2 leading-relaxed">{item.prompt}</p>
                        <div className="flex items-center text-xs text-warmwood-500 space-x-4 flex-wrap">
                          <span>🤖 {item.provider}</span>
                          <span>🎨 {item.model}</span>
                          <span>🎯 {item.quality}</span>
                          {item.createBackground ? <span>🌄 Background</span> : <span>🎮 Icon</span>}
                          <span>📐 {item.aspectRatio?.charAt(0).toUpperCase() + item.aspectRatio?.slice(1)}</span>
                          {item.useProjectPalette && <span>🎨 Palette</span>}
                          {item.selectedStyle && <span>🖌️ {item.selectedStyle.name}</span>}
                          {item.noText && !item.createBackground && <span>🚫 No text</span>}
                          {item.noBackground && !item.createBackground && <span>🔳 Transparent</span>}
                          {item.monochrome && <span>⚫ Monochrome</span>}
                        </div>
                        {item.error && (
                          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{item.error}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {item.status === 'pending' && !isGenerating && (
                          <button
                            onClick={() => generateIcon(item)}
                            className="p-2 text-sage-600 hover:text-sage-800 hover:bg-sage-100 rounded-lg transition-all"
                            title="Generate this icon"
                          >
                            ▶️
                          </button>
                        )}
                        <button
                          onClick={() => removeFromQueue(item.id)}
                          disabled={currentGenerating === item.id}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove from queue"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}