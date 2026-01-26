'use client'

import { useState } from 'react'
import { ImageGenerationRequest, ImageGenerationResponse } from '@/types/ai'
import { ColorPalette, projectUtils, getDefaultPalette } from '@/utils/projectUtils'

interface IconGenerationFormProps {
  selectedProvider: string
  selectedModel: string
  quality: string
  style: string
  onGenerationStart: () => void
  onGenerationComplete: (result: ImageGenerationResponse) => void
  onGenerationError: (error: string) => void
  onPromptChange?: (prompt: string) => void
  currentProject?: any
  usePalette?: boolean
  onProjectUpdate?: (project: any) => void
  selectedStyle?: any
  buildEnhancedPrompt?: (prompt: string) => string
  noText: boolean
  setNoText: (value: boolean) => void
  noBackground: boolean
  setNoBackground: (value: boolean) => void
  monochrome: boolean
  setMonochrome: (value: boolean) => void
  aspectRatio: 'square' | 'vertical' | 'horizontal'
  setAspectRatio: (value: 'square' | 'vertical' | 'horizontal') => void
  createBackground: boolean
  setCreateBackground: (value: boolean) => void
  getImageSize: (ratio: 'square' | 'vertical' | 'horizontal') => string
}

export default function IconGenerationForm({
  selectedProvider,
  selectedModel,
  quality,
  style,
  onGenerationStart,
  onGenerationComplete,
  onGenerationError,
  onPromptChange,
  currentProject,
  usePalette = true,
  selectedStyle,
  buildEnhancedPrompt,
  noText,
  setNoText,
  noBackground,
  setNoBackground,
  monochrome,
  setMonochrome,
  aspectRatio,
  setAspectRatio,
  createBackground,
  setCreateBackground,
  getImageSize
}: IconGenerationFormProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      onGenerationError('Please enter a prompt for your icon')
      return
    }

    setIsGenerating(true)
    onGenerationStart()

    try {
      // Use the enhanced prompt builder which handles style, palette, and toggles
      let finalPrompt = buildEnhancedPrompt ? buildEnhancedPrompt(prompt.trim()) : prompt.trim()

      const requestBody: ImageGenerationRequest = {
        prompt: finalPrompt,
        provider: selectedProvider as any,
        model: selectedModel,
        quality: quality as any,
        style: style as any,
        size: getImageSize(aspectRatio)
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

      onGenerationComplete(result)
    } catch (error) {
      console.error('Generation error:', error)
      onGenerationError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value
    setPrompt(newPrompt)
    onPromptChange?.(newPrompt)
  }

  return (
    <div className="bg-gradient-to-br from-cream-50 to-warmwood-50 rounded-2xl shadow-xl border-2 border-warmwood-200 p-8 relative">
      {/* Decorative magical elements */}
      <div className="absolute top-4 right-4 text-lg opacity-60 animate-pulse">✨</div>
      <div className="absolute bottom-4 left-4 text-sm opacity-40 animate-bounce">🎨</div>

      <div className="flex items-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl mr-4 shadow-lg">
          <span className="text-xl">🪄</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-warmwood-800">
            {createBackground ? 'Paint Your Game World' : 'Cast Your Creative Spell'}
          </h3>
          <p className="text-warmwood-600 text-sm">
            {createBackground
              ? 'Describe the magical game environment you wish to create'
              : 'Describe the magical icon you wish to create'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-warmwood-700 mb-3 flex items-center"
          >
            <span className="mr-2">📜</span>
            Your Icon Vision
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={handlePromptChange}
            placeholder={createBackground
              ? "Describe your game background... (e.g., 'Mystical forest with glowing mushrooms, fantasy RPG environment, detailed landscape')"
              : "Describe your game icon... (e.g., 'A magical sword with blue flames, fantasy RPG style, detailed icon')"
            }
            className="w-full p-4 border-2 border-warmwood-300 rounded-xl bg-cream-50 text-warmwood-800 placeholder-warmwood-500 focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition-all min-h-[120px] resize-none"
            disabled={isGenerating}
            maxLength={1000}
          />
          <div className="mt-2 flex justify-between items-center text-sm text-warmwood-600">
            <span>✨ Be specific for better results</span>
            <span>{prompt.length}/1000</span>
          </div>
        </div>

        {/* No Text Toggle */}
        <div className="bg-gradient-to-r from-sage-50 to-cream-100 rounded-lg p-4 border border-sage-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-3 text-lg">🚫</span>
              <div>
                <h4 className="font-medium text-warmwood-800">No Text Mode</h4>
                <p className="text-sm text-warmwood-600">Prevent any text or letters in the generated icon</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNoText(!noText)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 ${
                noText
                  ? 'bg-sage-600'
                  : 'bg-warmwood-300'
              }`}
            >
              <span
                className={`${
                  noText ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </button>
          </div>
        </div>

        {/* No Background Toggle */}
        <div className="bg-gradient-to-r from-sunset-50 to-cream-100 rounded-lg p-4 border border-sunset-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-3 text-lg">🔳</span>
              <div>
                <h4 className="font-medium text-warmwood-800">Transparent Background</h4>
                <p className="text-sm text-warmwood-600">Generate icon with transparent background for easy integration</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNoBackground(!noBackground)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sunset-500 focus:ring-offset-2 ${
                noBackground
                  ? 'bg-sunset-600'
                  : 'bg-warmwood-300'
              }`}
            >
              <span
                className={`${
                  noBackground ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </button>
          </div>
        </div>

        {/* Monochrome Toggle */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-lg p-4 border border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-3 text-lg">⚫</span>
              <div>
                <h4 className="font-medium text-warmwood-800">Monochrome Mode</h4>
                <p className="text-sm text-warmwood-600">Generate black icons on white background for clean, simple designs</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMonochrome(!monochrome)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                monochrome
                  ? 'bg-gray-800'
                  : 'bg-warmwood-300'
              }`}
            >
              <span
                className={`${
                  monochrome ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </button>
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="bg-gradient-to-r from-warmwood-50 to-cream-100 rounded-lg p-4 border border-warmwood-200">
          <div className="flex items-center mb-3">
            <span className="mr-3 text-lg">📐</span>
            <div>
              <h4 className="font-medium text-warmwood-800">Aspect Ratio</h4>
              <p className="text-sm text-warmwood-600">Choose the dimensions for your generated content</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'square', label: 'Square', icon: '⬜', desc: '1:1' },
              { key: 'vertical', label: 'Vertical', icon: '📱', desc: '9:16' },
              { key: 'horizontal', label: 'Horizontal', icon: '🖥️', desc: '16:9' }
            ].map((ratio) => (
              <button
                key={ratio.key}
                type="button"
                onClick={() => setAspectRatio(ratio.key as 'square' | 'vertical' | 'horizontal')}
                className={`p-3 rounded-lg text-center transition-all border-2 ${
                  aspectRatio === ratio.key
                    ? 'bg-sage-100 border-sage-400 text-sage-800'
                    : 'bg-cream-50 border-warmwood-300 text-warmwood-700 hover:border-sage-300'
                }`}
              >
                <div className="text-lg mb-1">{ratio.icon}</div>
                <div className="text-xs font-medium">{ratio.label}</div>
                <div className="text-xs opacity-75">{ratio.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Background Creation Toggle */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-3 text-lg">🌄</span>
              <div>
                <h4 className="font-medium text-warmwood-800">Background Creation Mode</h4>
                <p className="text-sm text-warmwood-600">{createBackground ? 'Generate game backgrounds and environments' : 'Generate icons and game assets'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCreateBackground(!createBackground)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                createBackground
                  ? 'bg-purple-600'
                  : 'bg-warmwood-300'
              }`}
            >
              <span
                className={`${
                  createBackground ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </button>
          </div>
        </div>

        {/* Palette Integration Status */}
        {currentProject?.colorPalette && (
          <div className={`rounded-lg p-4 border-2 transition-all ${
            usePalette && currentProject?.settings?.generateWithPalette
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
              : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="mr-3 text-lg">🎨</span>
                <div>
                  <h4 className="font-medium text-warmwood-800 flex items-center">
                    Palette: {currentProject.colorPalette.name}
                    {usePalette && currentProject?.settings?.generateWithPalette && (
                      <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        ✨ Active
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-warmwood-600 mt-1">
                    {usePalette && currentProject?.settings?.generateWithPalette
                      ? 'Colors will be automatically injected into your prompt'
                      : 'Palette available but not active - enable in project settings'}
                  </p>
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-warmwood-700">Colors:</span>
              {[
                { name: 'Primary', color: currentProject.colorPalette.primary },
                { name: 'Secondary', color: currentProject.colorPalette.secondary },
                { name: 'Accent', color: currentProject.colorPalette.accent },
                ...currentProject.colorPalette.custom.slice(0, 3).map(c => ({ name: c.name, color: c.hex }))
              ].slice(0, 6).map((item, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: item.color }}
                    title={`${item.name}: ${item.color}`}
                  />
                </div>
              ))}
              {currentProject.colorPalette.custom.length > 3 && (
                <span className="text-xs text-warmwood-500">+{currentProject.colorPalette.custom.length - 3} more</span>
              )}
            </div>

            {/* Injection Preview */}
            {usePalette && currentProject?.settings?.generateWithPalette && prompt.trim() && (
              <div className="mt-4 p-3 bg-emerald-100/50 rounded-lg border border-emerald-200">
                <div className="flex items-center mb-2">
                  <span className="mr-2 text-sm">🔮</span>
                  <span className="text-sm font-medium text-emerald-800">Prompt Preview with Colors:</span>
                </div>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  {projectUtils.enhancePromptWithPalette(prompt.trim(), currentProject.colorPalette)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-gradient-to-r from-warmwood-50 to-cream-100 rounded-lg p-4 border border-warmwood-200">
          <h4 className="font-medium text-warmwood-800 mb-2 flex items-center">
            <span className="mr-2">🎯</span>
            Pro Tips for Great Icons
          </h4>
          <ul className="text-sm text-warmwood-600 space-y-1">
            <li>• Include the style (pixel art, realistic, cartoon, etc.)</li>
            <li>• Mention it's an "icon" or "game icon" in your prompt</li>
            <li>• Specify colors, themes, or moods you want</li>
            <li>• Add "clean background" for better icon results</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform ${
            isGenerating || !prompt.trim()
              ? 'bg-warmwood-300 text-warmwood-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 hover:from-sage-600 hover:to-sage-700 hover:scale-105 shadow-lg hover:shadow-sage-200'
          } relative overflow-hidden`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-cream-200 border-t-transparent mr-3"></div>
              <span>{createBackground ? 'Painting Your World...' : 'Crafting Your Icon...'}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">{createBackground ? '🌄' : '🎨'}</span>
              <span>{createBackground ? 'Generate Magical Background' : 'Generate Magical Icon'}</span>
              <span className="ml-2">✨</span>
            </div>
          )}

          {/* Magic sparkle effect */}
          {!isGenerating && (
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden rounded-xl">
              <div className="absolute top-2 right-2 w-2 h-2 bg-cream-200 rounded-full animate-ping opacity-75"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-cream-300 rounded-full animate-ping opacity-50" style={{animationDelay: '1s'}}></div>
            </div>
          )}
        </button>

        {isGenerating && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-sage-100 text-sage-800 rounded-lg">
              <span className="mr-2">🔮</span>
              <span className="text-sm">Using magical {selectedProvider} powers...</span>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}