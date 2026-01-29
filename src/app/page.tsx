'use client'

import { useState, useEffect } from 'react'
import { AIProvider, ImageQuality, ImageStyle, ImageGenerationResponse } from '@/types/ai'
import { PROVIDERS } from '@/config/providers'
import { IconProject, projectUtils, getDefaultPalette } from '@/utils/projectUtils'
import ProviderSelector from '@/components/ProviderSelector'
import IconGenerationForm from '@/components/IconGenerationForm'
import GeneratedImageDisplay from '@/components/GeneratedImageDisplay'
import ErrorDisplay from '@/components/ErrorDisplay'
import ProjectSelector from '@/components/ProjectSelector'
import ProjectManager from '@/components/ProjectManager'
import ColorPaletteEditor from '@/components/ColorPaletteEditor'
import BatchGenerationQueue from '@/components/BatchGenerationQueue'
import ProjectIconGallery from '@/components/ProjectIconGallery'
import PaletteSelector from '@/components/PaletteSelector'
import StyleSelector, { GameIconStyle } from '@/components/StyleSelector'

export default function Home() {
  // State management
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('google')
  const [selectedModel, setSelectedModel] = useState(PROVIDERS.google.models[0].id)
  const [quality, setQuality] = useState<ImageQuality>('standard')
  const [style, setStyle] = useState<ImageStyle>('vivid')

  const [result, setResult] = useState<ImageGenerationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Project management state
  const [currentProject, setCurrentProject] = useState<IconProject | null>(null)
  const [showProjectManager, setShowProjectManager] = useState(false)
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [showBatchQueue, setShowBatchQueue] = useState(false)
  const [showIconGallery, setShowIconGallery] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<GameIconStyle | null>(null)
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [noText, setNoText] = useState(true)
  const [noBackground, setNoBackground] = useState(false)
  const [monochrome, setMonochrome] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<'square' | 'vertical' | 'horizontal'>('square')
  const [createBackground, setCreateBackground] = useState(false)

  // Initialize current project on mount
  useEffect(() => {
    let project = projectUtils.getCurrentProject()
    if (!project) {
      // Create default project if none exists
      project = projectUtils.createProject('My First Project', 'Collection of magical game icons')
      projectUtils.setCurrentProject(project)
    } else if (!project.colorPalette) {
      // Migrate existing projects without palettes
      project = {
        ...project,
        colorPalette: getDefaultPalette('fantasy'),
        generationQueue: project.generationQueue || []
      }
      projectUtils.updateProject(project.id, project)
      projectUtils.setCurrentProject(project)
    }
    setCurrentProject(project)
  }, [])

  // Handlers
  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider)
    setSelectedModel(PROVIDERS[provider].models[0].id)
  }

  const handleGenerationStart = () => {
    setIsGenerating(true)
    setError(null)
    setResult(null)
  }

  // Get image size based on aspect ratio (DALL-E 3 compatible sizes)
  const getImageSize = (ratio: 'square' | 'vertical' | 'horizontal') => {
    switch (ratio) {
      case 'vertical': return '1024x1792' // DALL-E 3 vertical format
      case 'horizontal': return '1792x1024' // DALL-E 3 horizontal format
      case 'square':
      default: return '1024x1024' // DALL-E 3 square format
    }
  }

  // Enhanced prompt generation with style and palette
  const buildEnhancedPrompt = (basePrompt: string) => {
    let enhancedPrompt = basePrompt.trim()

    // 1. Add style injection first
    if (selectedStyle && selectedStyle.promptInjection) {
      enhancedPrompt = projectUtils.enhancePromptWithStyle(enhancedPrompt, selectedStyle.promptInjection)
    }

    // 2. Add palette constraints
    if (currentProject?.settings?.generateWithPalette && currentProject?.colorPalette) {
      enhancedPrompt = projectUtils.enhancePromptWithPalette(enhancedPrompt, currentProject.colorPalette)
    }

    // 3. Add toggle directives
    if (createBackground) {
      enhancedPrompt = `game background, environment art, ${enhancedPrompt}, detailed game background scene, environment design`
    } else {
      enhancedPrompt = `game icon, ${enhancedPrompt}, icon design, game asset`
      if (noText) {
        enhancedPrompt = `${enhancedPrompt}, no text, no letters, no words, no writing, no typography, pure visual icon only`
      }
    }

    if (noBackground && !createBackground) {
      enhancedPrompt = `${enhancedPrompt}, transparent background, no background, isolated object, PNG with transparency, clean cutout, alpha channel`
    }
    if (monochrome) {
      enhancedPrompt = `${enhancedPrompt}, monochrome, black and white only, pure black icon on white background, high contrast, simple silhouette style, minimal color palette, black (#000000) and white (#FFFFFF) only`
    }

    // 4. Add aspect ratio directives
    if (aspectRatio === 'vertical') {
      enhancedPrompt = `${enhancedPrompt}, vertical composition, portrait orientation, taller than wide, vertical format`
    } else if (aspectRatio === 'horizontal') {
      enhancedPrompt = `${enhancedPrompt}, horizontal composition, landscape orientation, wider than tall, horizontal format`
    } else {
      enhancedPrompt = `${enhancedPrompt}, square composition, 1:1 aspect ratio, centered design`
    }

    return enhancedPrompt
  }

  const handleGenerationComplete = (generationResult: ImageGenerationResponse) => {
    setResult(generationResult)
    setIsGenerating(false)

    // Automatically save the generated icon to the current project
    if (currentProject && generationResult.success) {
      const iconName = generatedPrompt.split(' ').slice(0, 3).join(' ').trim() || 'Generated Icon'
      const finalIconName = iconName.length > 0 ? iconName : 'Generated Icon'

      const saveSuccess = projectUtils.addIconToProject(
        currentProject.id,
        generationResult,
        generatedPrompt,
        finalIconName
      )

      if (saveSuccess) {
        // Update the current project to reflect the new icon
        const updatedProject = projectUtils.getProject(currentProject.id)
        if (updatedProject) {
          setCurrentProject(updatedProject)
        }
      } else {
        console.warn('Failed to save icon - likely due to storage quota exceeded')
      }
    }
  }

  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage)
    setIsGenerating(false)
  }

  const handleClearResult = () => {
    setResult(null)
    setGeneratedPrompt('')
  }

  const handleSaveIcon = () => {
    if (!result || !currentProject || !result.success || !generatedPrompt) {
      console.log('Cannot save: missing data')
      return
    }

    const iconName = `Icon ${currentProject.icons.length + 1}`
    projectUtils.addIconToProject(currentProject.id, result, generatedPrompt, iconName)

    // Update current project state
    const updatedProject = projectUtils.getCurrentProject()
    if (updatedProject) {
      setCurrentProject(updatedProject)
    }

    console.log(`Icon saved to project: ${currentProject.name}`)
  }

  const handleDismissError = () => {
    setError(null)
  }

  // Project management handlers
  const handleProjectSelect = (project: IconProject) => {
    setCurrentProject(project)
    projectUtils.setCurrentProject(project)

    // Clear current generation when switching projects
    setResult(null)
    setError(null)
  }

  const handleOpenProjectManager = () => {
    setShowProjectManager(true)
  }

  const handleCloseProjectManager = () => {
    setShowProjectManager(false)
  }

  // Color palette handlers
  const handleOpenColorPalette = () => {
    if (currentProject && !currentProject.colorPalette) {
      // Ensure project has a valid palette before opening editor
      const updatedProject = {
        ...currentProject,
        colorPalette: getDefaultPalette('fantasy')
      }
      setCurrentProject(updatedProject)
      projectUtils.updateProject(updatedProject.id, updatedProject)
    }
    setShowColorPalette(true)
  }

  const handleCloseColorPalette = () => {
    setShowColorPalette(false)
  }

  const handlePaletteChange = (palette: any) => {
    if (!currentProject) return
    projectUtils.updatePalette(currentProject.id, palette)

    const updatedProject = projectUtils.getCurrentProject()
    if (updatedProject) {
      setCurrentProject(updatedProject)
    }
  }

  // Batch queue handlers
  const handleOpenBatchQueue = () => {
    setShowBatchQueue(true)
  }

  const handleCloseBatchQueue = () => {
    setShowBatchQueue(false)
  }

  // Icon gallery handlers
  const handleOpenIconGallery = () => {
    setShowIconGallery(true)
  }

  const handleCloseIconGallery = () => {
    setShowIconGallery(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-sage-50">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-sage-200 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-sunset-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-warmwood-200 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header with Project Selector */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl shadow-lg">
              <span className="text-2xl">🎮</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-warmwood-700 via-sage-700 to-sunset-600 bg-clip-text text-transparent">
                Cozy Icon Forge
              </h1>
              <p className="text-warmwood-600">Your magical AI icon workshop</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Project Tools */}
            <div className="flex space-x-2">
              <button
                onClick={handleOpenIconGallery}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 transition-all shadow-lg text-sm"
                title="View Icon Gallery"
              >
                <span className="mr-2">🖼️</span>
                Gallery
                {currentProject && currentProject.icons.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-cream-50 text-sage-700 rounded-full text-xs font-bold">
                    {currentProject.icons.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleOpenColorPalette}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-sunset-500 to-sunset-600 text-cream-50 rounded-lg hover:from-sunset-600 hover:to-sunset-700 transition-all shadow-lg text-sm"
                title="Edit Color Palette"
              >
                <span className="mr-2">🎨</span>
                Palette
              </button>
              <button
                onClick={handleOpenBatchQueue}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-warmwood-500 to-warmwood-600 text-cream-50 rounded-lg hover:from-warmwood-600 hover:to-warmwood-700 transition-all shadow-lg text-sm"
                title="Batch Generation Queue"
              >
                <span className="mr-2">⚡</span>
                Queue
                {currentProject && currentProject.generationQueue && currentProject.generationQueue.filter(item => item.status === 'pending').length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-cream-50 text-warmwood-700 rounded-full text-xs font-bold">
                    {currentProject.generationQueue.filter(item => item.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>

            {/* Project Selector */}
            <div className="min-w-0 max-w-xs">
              <ProjectSelector
                currentProject={currentProject}
                onProjectSelect={handleProjectSelect}
                onOpenProjectManager={handleOpenProjectManager}
              />
            </div>
          </div>
        </div>

        {/* Cozy Description */}
        <div className="text-center mb-16">
          <p className="text-xl text-warmwood-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Craft beautiful game icons with the magic of AI. Whether you're building a cozy village sim or an epic adventure,
            create icons that capture the heart of your game.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="inline-flex items-center px-4 py-2 bg-sage-100 text-sage-800 rounded-full text-sm font-medium border border-sage-200 shadow-sm">
              <span className="w-2 h-2 bg-sage-500 rounded-full mr-2 animate-pulse"></span>
              ✨ Cozy RPG Vibes
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-sunset-100 text-sunset-800 rounded-full text-sm font-medium border border-sunset-200 shadow-sm">
              <span className="w-2 h-2 bg-sunset-500 rounded-full mr-2 animate-pulse"></span>
              🎨 AI-Powered Magic
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-warmwood-100 text-warmwood-800 rounded-full text-sm font-medium border border-warmwood-200 shadow-sm">
              <span className="w-2 h-2 bg-warmwood-500 rounded-full mr-2 animate-pulse"></span>
              🏠 Game-Ready Icons
            </span>
          </div>
        </div>

        {/* Project Workspace Overview */}
        {currentProject && (
          <div className="bg-gradient-to-br from-sage-50 to-cream-100 border-2 border-sage-200 rounded-2xl p-6 shadow-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-warmwood-400 to-warmwood-600 rounded-xl mr-4 shadow-lg">
                  <span className="text-xl">🎨</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-warmwood-800">{currentProject.name}</h2>
                  <p className="text-warmwood-600">{currentProject.description || 'Your creative workspace'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-warmwood-600">
                <div className="flex items-center">
                  <span className="mr-1">🖼️</span>
                  <span>{currentProject.icons.length} icons</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">⏳</span>
                  <span>{currentProject.generationQueue?.filter(item => item.status === 'pending').length || 0} queued</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">🎨</span>
                  <span>{currentProject.colorPalette ? 'Custom palette' : 'Default colors'}</span>
                </div>
              </div>
            </div>

            {/* Quick Project Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-sage-100 to-sage-200 p-4 rounded-xl">
                <div className="text-2xl font-bold text-sage-800">{currentProject.icons.length}</div>
                <div className="text-sm text-sage-600">Total Icons</div>
              </div>
              <div className="bg-gradient-to-br from-sunset-100 to-sunset-200 p-4 rounded-xl">
                <div className="text-2xl font-bold text-sunset-800">
                  {currentProject.generationQueue?.filter(item => item.status === 'pending').length || 0}
                </div>
                <div className="text-sm text-sunset-600">Queued Items</div>
              </div>
              <div className="bg-gradient-to-br from-warmwood-100 to-warmwood-200 p-4 rounded-xl">
                <div className="text-2xl font-bold text-warmwood-800">
                  {currentProject.colorPalette?.custom.length || 0}
                </div>
                <div className="text-sm text-warmwood-600">Custom Colors</div>
              </div>
              <div className="bg-gradient-to-br from-cream-100 to-cream-200 p-4 rounded-xl">
                <div className="text-2xl font-bold text-cream-800">
                  {currentProject.generationQueue?.filter(item => item.status === 'completed').length || 0}
                </div>
                <div className="text-sm text-cream-700">Completed</div>
              </div>
            </div>

            {/* Recent Icons Preview */}
            {currentProject.icons.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-warmwood-800 mb-3 flex items-center">
                  <span className="mr-2">🖼️</span>
                  Recent Icons
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {currentProject.icons.slice(-6).map((icon, index) => (
                    <div key={icon.id} className="relative group">
                      <div className="aspect-square bg-cream-200 rounded-lg overflow-hidden border-2 border-warmwood-300 shadow-sm">
                        {icon.result.success && icon.result.imageUrl ? (
                          <img
                            src={icon.result.imageUrl}
                            alt={icon.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-warmwood-400">
                            <span className="text-2xl">🎨</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-warmwood-600 mt-1 truncate">{icon.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Color Palette Preview */}
            {currentProject.colorPalette && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-warmwood-800 mb-3 flex items-center">
                  <span className="mr-2">🌈</span>
                  Active Palette: {currentProject.colorPalette.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Primary', color: currentProject.colorPalette.primary },
                    { name: 'Secondary', color: currentProject.colorPalette.secondary },
                    { name: 'Accent', color: currentProject.colorPalette.accent },
                    ...currentProject.colorPalette.custom.slice(0, 3).map(c => ({ name: c.name, color: c.hex }))
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-cream-200 rounded-full px-3 py-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-warmwood-400 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium text-warmwood-700">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Settings & Input */}
          <div className="space-y-8">
            {/* Provider Settings */}
            <ProviderSelector
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              quality={quality}
              style={style}
              onProviderChange={handleProviderChange}
              onModelChange={setSelectedModel}
              onQualityChange={setQuality}
              onStyleChange={setStyle}
            />

            {/* Palette Selector */}
            <PaletteSelector
              currentProject={currentProject}
              onProjectUpdate={setCurrentProject}
            />

            {/* Style Selector */}
            <StyleSelector
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
            />

            {/* Generation Form */}
            <IconGenerationForm
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              quality={quality}
              style={style}
              onGenerationStart={handleGenerationStart}
              onGenerationComplete={handleGenerationComplete}
              onGenerationError={handleGenerationError}
              onPromptChange={setGeneratedPrompt}
              currentProject={currentProject}
              usePalette={true}
              selectedStyle={selectedStyle}
              buildEnhancedPrompt={buildEnhancedPrompt}
              noText={noText}
              setNoText={setNoText}
              noBackground={noBackground}
              setNoBackground={setNoBackground}
              monochrome={monochrome}
              setMonochrome={setMonochrome}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              createBackground={createBackground}
              setCreateBackground={setCreateBackground}
              getImageSize={getImageSize}
            />
          </div>

          {/* Right Column - Results & Info */}
          <div className="space-y-8">
            {/* Error Display */}
            <ErrorDisplay error={error} onDismiss={handleDismissError} />

            {/* Generated Image Display */}
            <GeneratedImageDisplay
              result={result}
              onClear={handleClearResult}
              onSave={handleSaveIcon}
            />

            {/* Welcome Instructions (when no result or error) */}
            {!result && !error && (
              <div className="bg-gradient-to-br from-sage-50 to-cream-100 border-2 border-sage-200 rounded-2xl p-8 shadow-xl relative">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 text-xl animate-pulse opacity-60">🌟</div>
                <div className="absolute bottom-4 left-4 text-sm animate-bounce opacity-40">✨</div>

                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-warmwood-400 to-warmwood-500 rounded-xl mr-4 shadow-lg">
                    <span className="text-xl">📚</span>
                  </div>
                  <h3 className="text-xl font-bold text-warmwood-800">Your Magical Journey Begins</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 bg-sage-200 text-sage-800 rounded-full text-sm font-bold mr-4 mt-1">1</div>
                    <p className="text-warmwood-700 leading-relaxed">
                      <span className="font-semibold">Choose your magical assistant</span> - Pick between 🍌 Nano Banana (Google AI) or 🎨 DALL-E (OpenAI).
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 bg-sunset-200 text-sunset-800 rounded-full text-sm font-bold mr-4 mt-1">2</div>
                    <p className="text-warmwood-700 leading-relaxed">
                      <span className="font-semibold">Describe your vision</span> - Paint a picture with words! The more details about colors, mood, and style, the better.
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 bg-warmwood-200 text-warmwood-800 rounded-full text-sm font-bold mr-4 mt-1">3</div>
                    <p className="text-warmwood-700 leading-relaxed">
                      <span className="font-semibold">Forge your icon</span> - Click the magical button and watch your vision come to life!
                    </p>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-8 h-8 bg-cream-300 text-warmwood-800 rounded-full text-sm font-bold mr-4 mt-1">4</div>
                    <p className="text-warmwood-700 leading-relaxed">
                      <span className="font-semibold">Treasure your creation</span> - Download your perfect 1024×1024 game icon!
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-sunset-50 to-warmwood-50 rounded-xl border border-sunset-200">
                  <div className="flex items-center mb-3">
                    <span className="text-xl mr-2">💡</span>
                    <h4 className="font-bold text-warmwood-800">Magical Tips for Better Results</h4>
                  </div>
                  <ul className="text-sm text-warmwood-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-sunset-500 mr-2">🎨</span>
                      <span><strong>Be descriptive:</strong> "A cozy mushroom house with glowing windows" works better than "house"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-sage-500 mr-2">🎮</span>
                      <span><strong>Mention game style:</strong> "pixel art", "hand-drawn", "3D cartoon", or "realistic"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-warmwood-500 mr-2">🌈</span>
                      <span><strong>Include colors:</strong> "warm golden tones", "bright blues", "earthy greens"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cream-600 mr-2">⭐</span>
                      <span><strong>Set the mood:</strong> "cozy", "mysterious", "adventurous", "peaceful"</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          currentProject={currentProject}
          onProjectSelect={handleProjectSelect}
          onClose={handleCloseProjectManager}
        />
      )}

      {/* Color Palette Editor Modal */}
      {showColorPalette && currentProject && currentProject.colorPalette && (
        <ColorPaletteEditor
          palette={currentProject.colorPalette}
          onPaletteChange={handlePaletteChange}
          onClose={handleCloseColorPalette}
        />
      )}

      {/* Batch Generation Queue Modal */}
      {showBatchQueue && (
        <BatchGenerationQueue
          project={currentProject}
          onProjectUpdate={setCurrentProject}
          onClose={handleCloseBatchQueue}
          selectedStyle={selectedStyle}
          noText={noText}
          noBackground={noBackground}
          monochrome={monochrome}
          aspectRatio={aspectRatio}
          createBackground={createBackground}
          getImageSize={getImageSize}
          buildEnhancedPrompt={buildEnhancedPrompt}
        />
      )}

      {/* Icon Gallery Modal */}
      {showIconGallery && (
        <ProjectIconGallery
          project={currentProject}
          onClose={handleCloseIconGallery}
          onProjectUpdate={setCurrentProject}
        />
      )}
    </div>
  )
}
