// API Route - Fresh 2025 Implementation
import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/services/ai'
import { AIProvider } from '@/types/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prompt,
      provider = 'google',
      model,
      quality = 'standard',
      style = 'vivid',
      size = '1024x1024'
    } = body

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Check provider availability
    const availableProviders = aiService.getAvailableProviders()
    if (availableProviders.length === 0) {
      return NextResponse.json(
        {
          error: 'No AI providers configured. Please add API keys.',
          availableProviders: []
        },
        { status: 503 }
      )
    }

    // Use requested provider or fallback to first available
    const useProvider: AIProvider = availableProviders.includes(provider)
      ? provider
      : availableProviders[0]

    if (!aiService.isProviderAvailable(useProvider)) {
      return NextResponse.json(
        {
          error: `${useProvider} provider not available`,
          availableProviders
        },
        { status: 400 }
      )
    }

    // Generate image
    const result = await aiService.generateImage({
      prompt: prompt.trim(),
      provider: useProvider,
      model,
      quality,
      style,
      size
    })

    if (!result.success) {
      const statusCode = getErrorStatusCode(result.error || '')
      return NextResponse.json(
        {
          error: result.error,
          provider: result.provider,
          model: result.model,
          availableProviders
        },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      provider: result.provider,
      model: result.model,
      cost: result.cost,
      generationTime: result.generationTime,
      revisedPrompt: result.revisedPrompt
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getErrorStatusCode(error: string): number {
  const errorLower = error.toLowerCase()

  if (errorLower.includes('quota') || errorLower.includes('rate limit')) {
    return 429
  }
  if (errorLower.includes('api key') || errorLower.includes('unauthorized')) {
    return 401
  }
  if (errorLower.includes('billing') || errorLower.includes('payment')) {
    return 402
  }
  if (errorLower.includes('content policy')) {
    return 400
  }

  return 500
}