'use client'

import { AIProvider, ImageQuality, ImageStyle } from '@/types/ai'
import { PROVIDERS } from '@/config/providers'

interface ProviderSelectorProps {
  selectedProvider: AIProvider
  selectedModel: string
  quality: ImageQuality
  style: ImageStyle
  onProviderChange: (provider: AIProvider) => void
  onModelChange: (model: string) => void
  onQualityChange: (quality: ImageQuality) => void
  onStyleChange: (style: ImageStyle) => void
}

export default function ProviderSelector({
  selectedProvider,
  selectedModel,
  quality,
  style,
  onProviderChange,
  onModelChange,
  onQualityChange,
  onStyleChange
}: ProviderSelectorProps) {
  const currentProvider = PROVIDERS[selectedProvider]
  const currentModel = currentProvider.models.find(m => m.id === selectedModel) || currentProvider.models[0]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 text-xs bg-gradient-to-r from-sage-100 to-sage-200 text-sage-800 rounded-full font-bold border border-sage-300 shadow-sm">✓ Active</span>
      case 'limited':
        return <span className="px-3 py-1 text-xs bg-gradient-to-r from-sunset-100 to-sunset-200 text-sunset-800 rounded-full font-bold border border-sunset-300 shadow-sm">⚠ Limited</span>
      case 'deprecated':
        return <span className="px-3 py-1 text-xs bg-gradient-to-r from-warmwood-200 to-warmwood-300 text-warmwood-800 rounded-full font-bold border border-warmwood-400 shadow-sm">⚠ Deprecated</span>
      default:
        return null
    }
  }

  return (
    <div className="bg-gradient-to-br from-cream-50 to-warmwood-50 rounded-2xl shadow-xl border-2 border-warmwood-200 p-8 relative hover:shadow-2xl transition-all duration-500 animate-fade-in-up overflow-hidden group">      {/* Subtle background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-sage-100/20 via-cream-100/20 to-sunset-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="relative z-10">
      {/* Enhanced Decorative magical elements */}
      <div className="absolute top-4 right-4 text-lg opacity-60 animate-pulse hover:opacity-100 hover:animate-bounce hover:scale-110 transition-all cursor-default">🪄</div>
      <div className="absolute bottom-4 left-4 text-sm opacity-40 animate-bounce hover:opacity-80 hover:animate-pulse transition-opacity cursor-default">⭐</div>
      <div className="absolute top-1/2 right-8 text-xs opacity-20 animate-cozy-float">✨</div>

      <div className="flex items-center mb-8 animate-fade-in-down" style={{animationDelay: '0.1s'}}>
        <div className="relative group/icon">
          <div className="absolute -inset-1 bg-gradient-to-r from-sage-400 via-sunset-400 to-warmwood-400 rounded-xl blur opacity-50 group-hover/icon:opacity-80 transition duration-300 animate-glow-pulse"></div>
          <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl mr-4 shadow-lg group-hover/icon:shadow-xl transform group-hover/icon:scale-110 transition-all duration-300">
            <span className="text-xl group-hover/icon:animate-gentle-bounce">🤖</span>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-warmwood-800">Choose Your AI Companion</h3>
          <p className="text-warmwood-600 text-sm">Select your magical assistant for icon creation</p>
        </div>
      </div>

      {/* Magical Provider Selection */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center">
          <span className="text-lg mr-2">🌟</span>
          <label className="text-lg font-bold text-warmwood-800">Your Magical Companions</label>
        </div>
        <div className="space-y-6">
          {Object.values(PROVIDERS).map((provider) => (
            <div
              key={provider.id}
              className={`group border-2 rounded-2xl p-6 cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden shadow-lg hover:shadow-2xl ${
                selectedProvider === provider.id
                  ? 'border-sage-400 bg-gradient-to-br from-sage-50 to-sage-100 shadow-sage-200 animate-glow-pulse'
                  : 'border-cream-300 bg-gradient-to-br from-cream-50 to-cream-100 hover:border-sage-300 hover:shadow-sage-100'
              }`}
              onClick={() => onProviderChange(provider.id)}
            >
              {/* Enhanced Selection glow effect */}
              {selectedProvider === provider.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-sage-100/60 via-sage-50/40 to-transparent animate-pulse"></div>
              )}

              {/* Hover shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="relative flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${
                    selectedProvider === provider.id
                      ? 'bg-gradient-to-br from-sage-400 to-sage-600 text-cream-50 animate-gentle-bounce'
                      : 'bg-gradient-to-br from-warmwood-300 to-warmwood-400 text-warmwood-800 group-hover:from-sage-300 group-hover:to-sage-400'
                  }`}>
                    <span className="text-xl group-hover:animate-pulse">{provider.id === 'google' ? '🍌' : '🎨'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <input
                        type="radio"
                        checked={selectedProvider === provider.id}
                        onChange={() => onProviderChange(provider.id)}
                        className="w-5 h-5 text-sage-600 focus:ring-sage-500 focus:ring-2"
                      />
                      <h4 className="font-bold text-warmwood-800 text-lg">{provider.name}</h4>
                    </div>
                    <p className="text-warmwood-600 leading-relaxed">{provider.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(provider.status)}
                </div>
              </div>

              <div className="relative bg-gradient-to-r from-warmwood-50 to-cream-100 rounded-lg p-3 border border-warmwood-200 hover:from-warmwood-100 hover:to-cream-200 transition-all duration-300">
                <p className="text-sm font-semibold text-warmwood-700 flex items-center">
                  <span className="mr-2 group-hover:animate-bounce">💰</span>
                  {provider.pricing}
                </p>
              </div>

              {/* Enhanced Magical sparkle for selected */}
              {selectedProvider === provider.id && (
                <div className="absolute top-2 right-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-sage-400 rounded-full animate-ping shadow-lg"></div>
                    <div className="w-2 h-2 bg-sunset-400 rounded-full animate-ping shadow-lg" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-1.5 h-1.5 bg-warmwood-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Model Selection */}
      <div className="mb-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
        <label className="block text-sm font-medium text-warmwood-700 mb-2">✨ Magical Model</label>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full p-3 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50 hover:bg-cream-100 hover:border-sage-300 transition-all duration-300 hover:shadow-md"
        >
          {currentProvider.models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} - {model.cost}
              {model.isRecommended && ' ⭐'}
              {model.deprecated && ' (Deprecated)'}
            </option>
          ))}
        </select>

        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-warmwood-600">Quality: </span>
            <span>{'★'.repeat(currentModel.qualityRating)}{'☆'.repeat(5 - currentModel.qualityRating)}</span>
          </div>
          <div>
            <span className="text-warmwood-600">Speed: </span>
            <span>{'⚡'.repeat(currentModel.speedRating)}{'○'.repeat(5 - currentModel.speedRating)}</span>
          </div>
        </div>
      </div>

      {/* Enhanced OpenAI Specific Settings */}
      {selectedProvider === 'openai' && (
        <div className="space-y-4 mb-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div>
            <label className="block text-sm font-medium text-warmwood-700 mb-2">✨ Quality</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="standard"
                  checked={quality === 'standard'}
                  onChange={() => onQualityChange('standard')}
                  className="mr-2"
                />
                Standard ($0.040)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="hd"
                  checked={quality === 'hd'}
                  onChange={() => onQualityChange('hd')}
                  className="mr-2"
                />
                HD ($0.080)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warmwood-700 mb-2">🎨 Style</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="vivid"
                  checked={style === 'vivid'}
                  onChange={() => onStyleChange('vivid')}
                  className="mr-2"
                />
                Vivid
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="natural"
                  checked={style === 'natural'}
                  onChange={() => onStyleChange('natural')}
                  className="mr-2"
                />
                Natural
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Current Selection Summary */}
      <div className="bg-gradient-to-br from-cream-100 to-sage-50 rounded-lg p-4 border border-warmwood-200 hover:shadow-lg hover:from-cream-200 hover:to-sage-100 transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
        <h4 className="font-medium text-warmwood-800 mb-2 flex items-center group"><span className="mr-2 group-hover:animate-bounce">🎯</span>Your Selection</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-warmwood-600">Provider:</span>
            <span className="font-medium">{currentProvider.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-warmwood-600">Model:</span>
            <span className="font-medium">{currentModel.name}</span>
          </div>
          {selectedProvider === 'openai' && (
            <>
              <div className="flex justify-between">
                <span className="text-warmwood-600">Quality:</span>
                <span className="font-medium">{quality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmwood-600">Style:</span>
                <span className="font-medium">{style}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}