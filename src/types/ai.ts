// AI Image Generation Types - Fresh 2025 Implementation

export type AIProvider = 'google' | 'openai'
export type ImageSize = '1024x1024' | '1792x1024' | '1024x1792'
export type ImageQuality = 'standard' | 'hd'
export type ImageStyle = 'vivid' | 'natural'

export interface ImageGenerationRequest {
  prompt: string
  provider: AIProvider
  model?: string
  size?: ImageSize
  quality?: ImageQuality
  style?: ImageStyle
}

export interface ImageGenerationResponse {
  success: boolean
  imageUrl?: string
  error?: string
  provider: AIProvider
  model: string
  cost?: number
  generationTime?: number
  revisedPrompt?: string // DALL-E 3 enhanced prompt
}

export interface AIModel {
  id: string
  name: string
  description: string
  cost: string
  maxResolution: string
  qualityRating: number
  speedRating: number
  isRecommended?: boolean
  deprecated?: string
}

export interface ProviderConfig {
  id: AIProvider
  name: string
  description: string
  models: AIModel[]
  features: string[]
  limitations: string[]
  pricing: string
  status: 'active' | 'deprecated' | 'limited'
}