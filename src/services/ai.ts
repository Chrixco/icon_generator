// AI Service - Fresh 2025 Implementation
import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import { ImageGenerationRequest, ImageGenerationResponse, AIProvider } from '@/types/ai'

class AIService {
  private googleAI: GoogleGenAI | null = null
  private openAI: OpenAI | null = null
  private initialized = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    try {
      // Initialize Google AI with 2025 SDK
      if (process.env.GOOGLE_AI_API_KEY) {
        this.googleAI = new GoogleGenAI({
          apiKey: process.env.GOOGLE_AI_API_KEY
        })
      }

      // Initialize OpenAI
      if (process.env.OPENAI_API_KEY) {
        this.openAI = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        })
      }

      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize AI services:', error)
    }
  }

  public isProviderAvailable(provider: AIProvider): boolean {
    switch (provider) {
      case 'google':
        return !!this.googleAI
      case 'openai':
        return !!this.openAI
      default:
        return false
    }
  }

  public getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = []
    if (this.googleAI) providers.push('google')
    if (this.openAI) providers.push('openai')
    return providers
  }

  private async generateWithGoogle(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now()

    if (!this.googleAI) {
      return {
        success: false,
        error: 'Google AI not configured',
        provider: 'google',
        model: 'unknown'
      }
    }

    try {
      const model = request.model || 'gemini-2.5-flash-image'

      // Enhanced prompt for game icons
      const enhancedPrompt = this.buildGameIconPrompt(request.prompt)

      const response = await this.googleAI.models.generateContent({
        model,
        contents: [{
          role: 'user',
          parts: [{ text: enhancedPrompt }]
        }]
      })

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No image generated')
      }

      const candidate = response.candidates[0]
      const imagePart = candidate.content?.parts?.find(part => 'inlineData' in part)

      if (!imagePart || !('inlineData' in imagePart) || !imagePart.inlineData?.data) {
        throw new Error('Invalid image data received')
      }

      const imageBase64 = imagePart.inlineData.data
      const imageUrl = `data:image/png;base64,${imageBase64}`

      return {
        success: true,
        imageUrl,
        provider: 'google',
        model,
        generationTime: Date.now() - startTime
      }

    } catch (error: any) {
      return {
        success: false,
        error: this.parseGoogleError(error),
        provider: 'google',
        model: request.model || 'gemini-2.5-flash-image',
        generationTime: Date.now() - startTime
      }
    }
  }

  private async generateWithOpenAI(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now()

    if (!this.openAI) {
      return {
        success: false,
        error: 'OpenAI not configured',
        provider: 'openai',
        model: 'unknown'
      }
    }

    try {
      const model = request.model || 'dall-e-3'
      const requestedQuality = request.quality || 'standard'
      const style = request.style || 'vivid'
      const size = request.size || '1024x1024'

      // CRITICAL: DALL-E 3 limitation - non-square sizes only work with 'standard' quality
      // If using non-square size with DALL-E 3, force quality to 'standard'
      const quality = (size !== '1024x1024' && model === 'dall-e-3') ? 'standard' : requestedQuality

      // Enhanced prompt for game icons
      const enhancedPrompt = this.buildGameIconPrompt(request.prompt)

      // Debug logging for aspect ratio issues
      console.log(`🎨 DALL-E API Request:`, {
        model,
        size,
        quality: quality,
        originalQuality: requestedQuality,
        isNonSquare: size !== '1024x1024'
      })

      const response = await this.openAI.images.generate({
        model: model as 'dall-e-2' | 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size as '1024x1024' | '1792x1024' | '1024x1792',
        quality: model === 'dall-e-3' ? (quality as 'standard' | 'hd') : undefined,
        style: model === 'dall-e-3' ? (style as 'vivid' | 'natural') : undefined,
        response_format: 'url'
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('No image generated')
      }

      const result = response.data[0]
      if (!result.url) {
        throw new Error('No image URL received')
      }

      // Convert to base64 for consistency
      let imageUrl = result.url
      try {
        const imageResponse = await fetch(result.url)
        if (imageResponse.ok) {
          const buffer = await imageResponse.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          imageUrl = `data:image/png;base64,${base64}`
        }
      } catch (e) {
        // Use original URL if conversion fails
      }

      // Calculate cost
      let cost = 0
      if (model === 'dall-e-3') {
        cost = quality === 'hd' ? 0.080 : 0.040
      } else if (model === 'dall-e-2') {
        cost = 0.020
      }

      return {
        success: true,
        imageUrl,
        provider: 'openai',
        model,
        cost,
        generationTime: Date.now() - startTime,
        revisedPrompt: result.revised_prompt
      }

    } catch (error: any) {
      return {
        success: false,
        error: this.parseOpenAIError(error),
        provider: 'openai',
        model: request.model || 'dall-e-3',
        generationTime: Date.now() - startTime
      }
    }
  }

  public async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (!this.isProviderAvailable(request.provider)) {
      return {
        success: false,
        error: `${request.provider} provider not available`,
        provider: request.provider,
        model: 'unknown'
      }
    }

    switch (request.provider) {
      case 'google':
        return this.generateWithGoogle(request)
      case 'openai':
        return this.generateWithOpenAI(request)
      default:
        return {
          success: false,
          error: `Unsupported provider: ${request.provider}`,
          provider: request.provider,
          model: 'unknown'
        }
    }
  }

  private buildGameIconPrompt(description: string): string {
    return `Create a stunning game icon for mobile and desktop applications.

DESCRIPTION: ${description}

TECHNICAL REQUIREMENTS:
- High contrast and bold colors that work at small sizes
- Clear, memorable design with strong visual hierarchy
- Solid background (no transparency)
- Professional game art quality
- Compatible with app store requirements

VISUAL GUIDELINES:
- Modern game icon aesthetics with premium feel
- Eye-catching composition with single focal point
- Distinctive silhouette recognizable at any size
- Rich, saturated colors with strategic gradients
- Clean, bold design elements

Create an exceptional game icon that perfectly captures this concept while meeting all modern app store requirements. Make it bold, memorable, and instantly recognizable as a premium game icon.`
  }

  private parseGoogleError(error: any): string {
    const message = error?.message?.toLowerCase() || ''

    if (message.includes('quota') || message.includes('429')) {
      return 'Google AI quota exceeded. Free tier is limited to 0 requests per day.'
    }
    if (message.includes('api key') || message.includes('unauthorized')) {
      return 'Invalid Google AI API key'
    }
    if (message.includes('billing')) {
      return 'Google AI billing issue. Enable billing in your Google Cloud account.'
    }

    return error?.message || 'Google AI generation failed'
  }

  private parseOpenAIError(error: any): string {
    const message = error?.message?.toLowerCase() || ''

    if (message.includes('billing') || message.includes('hard limit')) {
      return 'OpenAI billing limit reached. Add payment method to your OpenAI account.'
    }
    if (message.includes('insufficient_quota') || message.includes('rate_limit')) {
      return 'OpenAI rate limit exceeded. Try again later.'
    }
    if (message.includes('content_policy')) {
      return 'Request violates OpenAI content policy. Try rephrasing your prompt.'
    }
    if (message.includes('api_key') || message.includes('unauthorized')) {
      return 'Invalid OpenAI API key'
    }

    return error?.message || 'OpenAI generation failed'
  }
}

export const aiService = new AIService()