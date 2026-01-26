'use client'

import { useState } from 'react'
import { ColorPalette, ColorCustom } from '@/utils/projectUtils'

interface ColorPaletteEditorProps {
  palette: ColorPalette
  onPaletteChange: (palette: ColorPalette) => void
  onClose: () => void
}

export default function ColorPaletteEditor({ palette, onPaletteChange, onClose }: ColorPaletteEditorProps) {
  const [editingPalette, setEditingPalette] = useState<ColorPalette>({
    ...palette,
    custom: palette.custom || []
  })
  const [activePreset, setActivePreset] = useState<string>('')

  // Color presets for quick selection
  const colorPresets = {
    fantasy: {
      name: 'Fantasy Adventure',
      colors: {
        primary: '#8B4513',
        secondary: '#DAA520',
        background: '#F5F5DC',
        surface: '#FFFAF0',
        accent: '#FF6347',
        text: '#2F4F4F',
        textSecondary: '#696969',
        border: '#D2B48C',
        success: '#228B22',
        warning: '#FF8C00',
        error: '#DC143C'
      }
    },
    'sci-fi': {
      name: 'Sci-Fi Future',
      colors: {
        primary: '#00BFFF',
        secondary: '#7B68EE',
        background: '#191970',
        surface: '#2F4F4F',
        accent: '#00FFFF',
        text: '#E0E0E0',
        textSecondary: '#A9A9A9',
        border: '#4682B4',
        success: '#00FF00',
        warning: '#FFD700',
        error: '#FF1493'
      }
    },
    modern: {
      name: 'Modern Clean',
      colors: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        accent: '#F59E0B',
        text: '#0F172A',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626'
      }
    },
    nature: {
      name: 'Nature Harmony',
      colors: {
        primary: '#16A085',
        secondary: '#27AE60',
        background: '#F0FFF0',
        surface: '#F5FFFA',
        accent: '#FFB347',
        text: '#2D4A22',
        textSecondary: '#5D6D5D',
        border: '#98FB98',
        success: '#228B22',
        warning: '#FF8C00',
        error: '#CD5C5C'
      }
    }
  }

  const handleColorChange = (colorKey: keyof ColorPalette, value: string) => {
    if (colorKey === 'custom' || colorKey === 'id' || colorKey === 'name') return
    setEditingPalette(prev => ({ ...prev, [colorKey]: value }))
  }

  const handlePresetSelect = (presetKey: string) => {
    const preset = colorPresets[presetKey as keyof typeof colorPresets]
    if (preset) {
      setEditingPalette(prev => ({
        ...prev,
        ...preset.colors,
        name: preset.name
      }))
      setActivePreset(presetKey)
    }
  }

  const addCustomColor = () => {
    const customArray = editingPalette.custom || []
    const newCustomColor: ColorCustom = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Custom Color ${customArray.length + 1}`,
      hex: '#6366F1',
      description: ''
    }

    setEditingPalette(prev => ({
      ...prev,
      custom: [...customArray, newCustomColor]
    }))
  }

  const updateCustomColor = (index: number, updates: Partial<ColorCustom>) => {
    const customArray = editingPalette.custom || []
    const newCustomColors = [...customArray]
    newCustomColors[index] = { ...newCustomColors[index], ...updates }
    setEditingPalette(prev => ({ ...prev, custom: newCustomColors }))
  }

  const removeCustomColor = (index: number) => {
    const customArray = editingPalette.custom || []
    setEditingPalette(prev => ({
      ...prev,
      custom: customArray.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    onPaletteChange(editingPalette)
    onClose()
  }

  const colorFields = [
    { key: 'primary', label: 'Primary', description: 'Main brand color for important elements' },
    { key: 'secondary', label: 'Secondary', description: 'Supporting brand color' },
    { key: 'accent', label: 'Accent', description: 'Highlights and call-to-action elements' },
    { key: 'background', label: 'Background', description: 'Main background color' },
    { key: 'surface', label: 'Surface', description: 'Card and panel backgrounds' },
    { key: 'text', label: 'Primary Text', description: 'Main text color' },
    { key: 'textSecondary', label: 'Secondary Text', description: 'Subdued text color' },
    { key: 'border', label: 'Border', description: 'Borders and dividers' },
    { key: 'success', label: 'Success', description: 'Success states and confirmations' },
    { key: 'warning', label: 'Warning', description: 'Warning states and cautions' },
    { key: 'error', label: 'Error', description: 'Error states and alerts' }
  ] as const

  return (
    <div className="fixed inset-0 bg-warmwood-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-cream-50 to-sage-50 rounded-2xl shadow-2xl border-2 border-sage-200 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sunset-400 to-sunset-600 rounded-xl mr-4 shadow-lg">
              <span className="text-xl">🎨</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-warmwood-800">Color Palette Editor</h2>
              <p className="text-warmwood-600 text-sm">Customize your project's visual identity</p>
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
          {/* Palette Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-warmwood-700 mb-2">Palette Name</label>
            <input
              type="text"
              value={editingPalette.name}
              onChange={(e) => setEditingPalette(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50"
              placeholder="My Custom Palette"
            />
          </div>

          {/* Preset Themes */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-warmwood-800 mb-4 flex items-center">
              <span className="mr-2">🎭</span>
              Theme Presets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(colorPresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    activePreset === key
                      ? 'border-sage-400 bg-sage-50 shadow-lg'
                      : 'border-cream-300 bg-cream-100 hover:border-sage-300'
                  }`}
                >
                  <div className="text-sm font-medium text-warmwood-800 mb-2">{preset.name}</div>
                  <div className="flex space-x-1">
                    {[preset.colors.primary, preset.colors.secondary, preset.colors.accent].map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Fields */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-warmwood-800 mb-4 flex items-center">
              <span className="mr-2">🌈</span>
              Base Colors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colorFields.map(({ key, label, description }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-warmwood-700">
                    {label}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={editingPalette[key] as string}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-warmwood-300 cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingPalette[key] as string}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="w-full p-2 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50 font-mono text-sm"
                        placeholder="#000000"
                      />
                      <p className="text-xs text-warmwood-600 mt-1">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-warmwood-800 flex items-center">
                <span className="mr-2">✨</span>
                Custom Colors
              </h3>
              <button
                onClick={addCustomColor}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 transition-all shadow-lg text-sm"
              >
                <span className="mr-2">+</span>
                Add Color
              </button>
            </div>

            <div className="space-y-4">
              {editingPalette.custom && editingPalette.custom.map((customColor, index) => (
                <div key={customColor.id} className="flex items-center space-x-4 p-4 bg-cream-100 rounded-lg">
                  <input
                    type="color"
                    value={customColor.hex}
                    onChange={(e) => updateCustomColor(index, { hex: e.target.value })}
                    className="w-10 h-10 rounded-lg border-2 border-warmwood-300 cursor-pointer"
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={customColor.name}
                      onChange={(e) => updateCustomColor(index, { name: e.target.value })}
                      className="p-2 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50"
                      placeholder="Color name"
                    />
                    <input
                      type="text"
                      value={customColor.description || ''}
                      onChange={(e) => updateCustomColor(index, { description: e.target.value })}
                      className="p-2 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50"
                      placeholder="Description (optional)"
                    />
                  </div>
                  <button
                    onClick={() => removeCustomColor(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all"
                  >
                    🗑️
                  </button>
                </div>
              ))}

              {(!editingPalette.custom || editingPalette.custom.length === 0) && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-sage-200 to-sage-300 rounded-full flex items-center justify-center">
                    <span className="text-2xl opacity-60">🎨</span>
                  </div>
                  <h4 className="text-lg font-medium text-warmwood-800 mb-2">No Custom Colors</h4>
                  <p className="text-warmwood-600 mb-4">Add custom colors specific to your project theme</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-warmwood-800 mb-4 flex items-center">
              <span className="mr-2">👁️</span>
              Preview
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[...colorFields.map(f => ({ name: f.label, color: editingPalette[f.key] as string })),
                ...(editingPalette.custom || []).map(c => ({ name: c.name, color: c.hex }))].map((item, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-full h-12 rounded-lg border-2 border-warmwood-300 mb-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-xs text-warmwood-700 truncate">{item.name}</p>
                  <p className="text-xs text-warmwood-500 font-mono">{item.color}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-sage-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 transition-all shadow-lg font-medium"
            >
              Save Palette
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}