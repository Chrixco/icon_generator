'use client'

import { useState } from 'react'
import { IconProject, getDefaultPalette, projectUtils } from '@/utils/projectUtils'

interface PaletteSelectorProps {
  currentProject: IconProject | null
  onProjectUpdate: (project: IconProject) => void
}

export default function PaletteSelector({ currentProject, onProjectUpdate }: PaletteSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  if (!currentProject) return null

  const availablePalettes = [
    { key: 'fantasy', name: 'Fantasy Adventure', preview: ['#8B4513', '#DAA520', '#FF6347'] },
    { key: 'sci-fi', name: 'Sci-Fi Future', preview: ['#00BFFF', '#7B68EE', '#00FFFF'] },
    { key: 'modern', name: 'Modern Clean', preview: ['#2563EB', '#7C3AED', '#F59E0B'] },
    { key: 'nature', name: 'Nature Harmony', preview: ['#16A085', '#27AE60', '#FFB347'] }
  ]

  const handlePaletteChange = (paletteKey: string) => {
    const newPalette = getDefaultPalette(paletteKey as any)
    const updatedProject = {
      ...currentProject,
      colorPalette: newPalette,
      updatedAt: new Date()
    }

    projectUtils.updateProject(currentProject.id, updatedProject)
    onProjectUpdate(updatedProject)
    setShowDropdown(false)
  }

  const togglePalette = () => {
    const updatedProject = {
      ...currentProject,
      settings: {
        ...currentProject.settings,
        generateWithPalette: !currentProject.settings.generateWithPalette
      },
      updatedAt: new Date()
    }

    projectUtils.updateProject(currentProject.id, updatedProject)
    onProjectUpdate(updatedProject)
  }

  const currentPalette = currentProject.colorPalette
  const isActive = currentProject.settings?.generateWithPalette

  return (
    <div className={`rounded-lg p-4 border-2 transition-all ${
      isActive
        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
        : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center flex-1">
          <span className="mr-3 text-lg">🎨</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center font-medium text-warmwood-800 hover:text-sage-700 transition-colors"
                >
                  Palette: {currentPalette?.name || 'None'}
                  <span className="ml-2 text-sm">▼</span>
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-sage-200 z-50">
                    <div className="p-2">
                      {availablePalettes.map((palette) => (
                        <button
                          key={palette.key}
                          onClick={() => handlePaletteChange(palette.key)}
                          className={`w-full p-3 rounded-lg text-left hover:bg-sage-50 transition-all ${
                            currentPalette?.name === palette.name ? 'bg-sage-100 border border-sage-300' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-warmwood-800">{palette.name}</span>
                            <div className="flex space-x-1">
                              {palette.preview.map((color, index) => (
                                <div
                                  key={index}
                                  className="w-4 h-4 rounded-full border border-white shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isActive && (
                <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  ✨ Active
                </span>
              )}
            </div>

            <div className="flex items-center mt-2">
              <p className="text-sm text-warmwood-600">
                {isActive
                  ? 'Colors will be automatically injected into your prompt'
                  : 'Palette available but not active'}
              </p>
              <button
                onClick={togglePalette}
                className={`ml-3 relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 ${
                  isActive ? 'bg-sage-600' : 'bg-warmwood-300'
                }`}
              >
                <span
                  className={`${
                    isActive ? 'translate-x-5' : 'translate-x-1'
                  } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Color Preview */}
      {currentPalette && (
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-sm font-medium text-warmwood-700">Colors:</span>
          {[
            { name: 'Primary', color: currentPalette.primary },
            { name: 'Secondary', color: currentPalette.secondary },
            { name: 'Accent', color: currentPalette.accent },
            ...currentPalette.custom.slice(0, 3).map(c => ({ name: c.name, color: c.hex }))
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
          {currentPalette.custom.length > 3 && (
            <span className="text-xs text-warmwood-500">+{currentPalette.custom.length - 3} more</span>
          )}
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
  )
}