'use client'

import { useState } from 'react'

export interface GameIconStyle {
  id: string
  name: string
  description: string
  preview: string
  promptInjection: string
}

const PREDEFINED_STYLES: GameIconStyle[] = [
  {
    id: 'pixel-art',
    name: '8-Bit Pixel Art',
    description: 'Retro pixelated style with crisp edges and limited colors',
    preview: '🎮',
    promptInjection: 'pixel art style, 8-bit retro graphics, crisp pixel edges, no anti-aliasing, limited color palette, classic video game aesthetic, sharp geometric shapes, pixelated details, retro gaming style, clean pixel work, blocky design, vintage arcade look'
  },
  {
    id: 'hand-drawn',
    name: 'Hand-Drawn Sketch',
    description: 'Artistic hand-drawn look with visible brush strokes',
    preview: '✏️',
    promptInjection: 'hand-drawn illustration, sketch style, visible brush strokes, artistic drawing, pencil sketch aesthetic, traditional art style, organic lines, handcrafted appearance, sketchy details, artistic illustration, drawn by hand, traditional media look'
  },
  {
    id: 'cartoon-3d',
    name: 'Cartoon 3D',
    description: 'Colorful 3D cartoon style with smooth surfaces',
    preview: '🎨',
    promptInjection: '3D cartoon style, smooth rounded surfaces, vibrant colors, soft shading, Pixar-like rendering, clean 3D modeling, cartoon proportions, glossy finish, smooth gradients, playful 3D design, animated movie style, polished 3D render'
  },
  {
    id: 'realistic',
    name: 'Photorealistic',
    description: 'Highly detailed realistic rendering with accurate materials',
    preview: '📸',
    promptInjection: 'photorealistic rendering, hyperrealistic details, accurate materials and textures, realistic lighting and shadows, high-definition quality, lifelike appearance, detailed surface textures, realistic proportions, professional photography style, ultra-detailed, cinematic lighting'
  },
  {
    id: 'minimalist',
    name: 'Minimalist Flat',
    description: 'Clean flat design with simple shapes and solid colors',
    preview: '⚪',
    promptInjection: 'minimalist flat design, simple geometric shapes, solid flat colors, no gradients or shadows, clean lines, modern flat UI style, simplified forms, vector art style, geometric simplicity, flat illustration, minimal details, contemporary design'
  },
  {
    id: 'medieval-fantasy',
    name: 'Medieval Fantasy',
    description: 'Rich fantasy art with medieval themes and ornate details',
    preview: '⚔️',
    promptInjection: 'medieval fantasy art style, ornate decorative details, gothic design elements, rich textures, aged metal and leather, mystical engravings, heraldic symbols, elaborate craftsmanship, fantasy RPG aesthetic, magical aura, ancient artifacts style'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Futuristic style with neon glows and tech elements',
    preview: '🌟',
    promptInjection: 'cyberpunk aesthetic, neon glow effects, holographic elements, futuristic technology, digital interfaces, chrome and metal surfaces, electric blue and pink highlights, sci-fi tech design, glowing circuit patterns, high-tech cybernetic style'
  },
  {
    id: 'watercolor',
    name: 'Watercolor Paint',
    description: 'Soft watercolor painting with flowing colors and bleeds',
    preview: '🎭',
    promptInjection: 'watercolor painting style, soft color bleeds, flowing pigments, paper texture visible, artistic brush marks, transparent washes, organic color mixing, traditional watercolor techniques, painterly quality, soft edges, artistic medium'
  },
  {
    id: 'steampunk',
    name: 'Steampunk Victorian',
    description: 'Victorian-era industrial design with brass and gears',
    preview: '⚙️',
    promptInjection: 'steampunk design, Victorian era industrial aesthetic, brass and copper materials, visible gears and clockwork, steam-powered mechanisms, intricate mechanical details, vintage industrial design, ornate metalwork, retro-futuristic technology'
  },
  {
    id: 'anime-manga',
    name: 'Anime/Manga',
    description: 'Japanese anime style with bold lines and vibrant colors',
    preview: '🌸',
    promptInjection: 'anime art style, manga illustration, bold clean linework, vibrant saturated colors, stylized proportions, Japanese animation aesthetic, cel-shading style, dynamic poses, expressive design, anime character style, manga artwork'
  }
]

interface StyleSelectorProps {
  selectedStyle: GameIconStyle | null
  onStyleChange: (style: GameIconStyle | null) => void
}

export default function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleStyleSelect = (style: GameIconStyle) => {
    onStyleChange(style)
    setShowDropdown(false)
  }

  const clearStyle = () => {
    onStyleChange(null)
    setShowDropdown(false)
  }

  return (
    <div className="bg-gradient-to-br from-cream-50 to-warmwood-50 rounded-2xl shadow-xl border-2 border-warmwood-200 p-6 relative">
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 text-lg opacity-60 animate-pulse">🎨</div>
      <div className="absolute bottom-4 left-4 text-sm opacity-40 animate-bounce">✨</div>

      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sunset-400 to-sunset-600 rounded-xl mr-4 shadow-lg">
          <span className="text-xl">🖌️</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-warmwood-800">Art Style Selector</h3>
          <p className="text-warmwood-600 text-sm">Choose a predefined style for your icons</p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            selectedStyle
              ? 'bg-gradient-to-r from-sage-50 to-emerald-50 border-sage-300'
              : 'bg-cream-100 border-warmwood-300 hover:border-sage-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {selectedStyle ? (
                <>
                  <span className="text-2xl mr-3">{selectedStyle.preview}</span>
                  <div>
                    <div className="font-bold text-warmwood-800">{selectedStyle.name}</div>
                    <div className="text-sm text-warmwood-600">{selectedStyle.description}</div>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-2xl mr-3">🎨</span>
                  <div>
                    <div className="font-bold text-warmwood-800">No Style Selected</div>
                    <div className="text-sm text-warmwood-600">Click to choose an art style</div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {selectedStyle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearStyle()
                  }}
                  className="p-1 text-warmwood-500 hover:text-red-600 rounded transition-colors"
                  title="Clear style"
                >
                  ✕
                </button>
              )}
              <span className="text-warmwood-500">
                {showDropdown ? '▲' : '▼'}
              </span>
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-sage-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              {/* Clear Option */}
              <button
                onClick={clearStyle}
                className="w-full p-3 rounded-lg text-left hover:bg-gray-50 transition-all border-b border-gray-100"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🚫</span>
                  <div>
                    <div className="font-medium text-warmwood-800">No Style</div>
                    <div className="text-sm text-warmwood-600">Use default generation without style injection</div>
                  </div>
                </div>
              </button>

              {/* Style Options */}
              {PREDEFINED_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style)}
                  className={`w-full p-3 rounded-lg text-left transition-all hover:bg-sage-50 ${
                    selectedStyle?.id === style.id
                      ? 'bg-sage-100 border border-sage-300'
                      : 'hover:bg-sage-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{style.preview}</span>
                    <div className="flex-1">
                      <div className="font-medium text-warmwood-800">{style.name}</div>
                      <div className="text-sm text-warmwood-600 leading-relaxed">{style.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Click outside handler */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Selected Style Preview */}
      {selectedStyle && (
        <div className="mt-6 p-4 bg-gradient-to-r from-sage-50 to-emerald-50 rounded-xl border border-sage-200">
          <div className="flex items-center mb-3">
            <span className="mr-2 text-lg">🎯</span>
            <span className="font-medium text-emerald-800">Style Active: {selectedStyle.name}</span>
          </div>
          <div className="text-sm text-emerald-700">
            This style will automatically enhance your prompts with detailed artistic directions to achieve the {selectedStyle.name.toLowerCase()} aesthetic.
          </div>
        </div>
      )}
    </div>
  )
}