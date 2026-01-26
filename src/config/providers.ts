// AI Provider Configurations - 2025 Edition
import { ProviderConfig, AIProvider } from '@/types/ai'

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  google: {
    id: 'google',
    name: 'Google AI (Nano Banana)',
    description: 'Gemini models with advanced image generation capabilities',
    status: 'limited',
    pricing: 'Free tier limited, pay-per-use available',
    models: [
      {
        id: 'gemini-2.5-flash-image',
        name: 'Nano Banana (Gemini 2.5 Flash)',
        description: 'Fast, high-quality image generation',
        cost: '$0.02-0.04 per image',
        maxResolution: '1024×1024',
        qualityRating: 4,
        speedRating: 5,
        isRecommended: true
      },
      {
        id: 'gemini-3-pro-image-preview',
        name: 'Nano Banana Pro (Gemini 3 Pro)',
        description: 'Premium model with enhanced capabilities',
        cost: '$0.06-0.08 per image',
        maxResolution: '4096×4096',
        qualityRating: 5,
        speedRating: 3
      }
    ],
    features: [
      'Fast generation with Flash model',
      'High-quality image output',
      'Multi-modal capabilities',
      'Reference image support',
      'Advanced prompt understanding'
    ],
    limitations: [
      'Free tier severely limited (0 requests/day)',
      'Requires billing setup for usage',
      'Geographic restrictions may apply'
    ]
  },
  openai: {
    id: 'openai',
    name: 'OpenAI (DALL-E)',
    description: 'DALL-E models for creative image generation',
    status: 'deprecated',
    pricing: '$0.040-0.080 per image, no free tier',
    models: [
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        description: 'Advanced text-to-image generation',
        cost: '$0.040 (standard), $0.080 (HD)',
        maxResolution: '1024×1024, 1792×1024, 1024×1792',
        qualityRating: 5,
        speedRating: 3,
        deprecated: 'May 12, 2026'
      },
      {
        id: 'dall-e-2',
        name: 'DALL-E 2',
        description: 'Legacy model with basic capabilities',
        cost: '$0.020 per image',
        maxResolution: '1024×1024',
        qualityRating: 3,
        speedRating: 4,
        deprecated: 'May 12, 2026'
      }
    ],
    features: [
      'Automatic prompt enhancement',
      'Multiple resolution options',
      'Quality settings (standard/HD)',
      'Style control (vivid/natural)',
      'Reliable results'
    ],
    limitations: [
      'DEPRECATED: Ends May 12, 2026',
      'No free tier available',
      'Billing required',
      'Content policy restrictions',
      'No reference image support'
    ]
  }
}