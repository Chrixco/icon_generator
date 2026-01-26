// Project Management Utilities for Game Icon Generator

import { ImageGenerationResponse } from '@/types/ai'

export interface IconProject {
  id: string
  name: string
  description?: string
  icons: SavedIcon[]
  generationQueue: IconQueueItem[]
  colorPalette: ColorPalette
  createdAt: Date
  updatedAt: Date
  settings: ProjectSettings
}

export interface SavedIcon {
  id: string
  name: string
  prompt: string
  enhancedPrompt?: string // The actual prompt sent to API with palette colors
  result?: any // Store the full generation result
  imageUrl: string
  provider: string
  model: string
  generatedAt: Date
  cost?: number
  generationTime?: number
  tags: string[]
  usedColors?: string[] // Colors from palette used in generation
}

export interface IconQueueItem {
  id: string
  name: string
  prompt: string
  priority: number
  status: 'pending' | 'generating' | 'completed' | 'failed'
  provider: string
  model: string
  quality: string
  style: string
  useProjectPalette: boolean
  noText: boolean
  noBackground: boolean
  monochrome: boolean
  aspectRatio: 'square' | 'vertical' | 'horizontal'
  createBackground: boolean
  selectedStyle?: any // GameIconStyle object
  createdAt: Date
  result?: any
  error?: string
}

export interface ColorPalette {
  id: string
  name: string
  primary: string      // Main brand color
  secondary: string    // Accent color
  background: string   // Background color
  surface: string      // Card/panel surfaces
  accent: string       // Highlights and CTAs
  text: string         // Primary text
  textSecondary: string // Secondary text
  border: string       // Borders and dividers
  success: string      // Success states
  warning: string      // Warning states
  error: string        // Error states
  custom: ColorCustom[] // Additional custom colors
}

export interface ColorCustom {
  id: string
  name: string
  hex: string
  description?: string
}

export interface ProjectSettings {
  defaultProvider: string
  defaultModel: string
  defaultQuality: string
  defaultStyle: string
  autoSave: boolean
  projectTheme?: string
  usePaletteInPrompts: boolean
  batchSize: number
  generateWithPalette: boolean
}

// Local Storage Keys
const STORAGE_KEYS = {
  PROJECTS: 'icon-generator-projects',
  CURRENT_PROJECT: 'icon-generator-current-project',
  USER_SETTINGS: 'icon-generator-user-settings',
  RECENT_PROMPTS: 'icon-generator-recent-prompts'
}

// Project Management Functions
export const projectUtils = {
  // Create a new project
  createProject: (name: string, description?: string, colorTheme?: 'fantasy' | 'sci-fi' | 'modern' | 'nature' | 'custom'): IconProject => {
    const project: IconProject = {
      id: generateId(),
      name,
      description,
      icons: [],
      generationQueue: [],
      colorPalette: getDefaultPalette(colorTheme || 'fantasy'),
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        defaultProvider: 'google',
        defaultModel: 'gemini-2.5-flash-image',
        defaultQuality: 'standard',
        defaultStyle: 'vivid',
        autoSave: true,
        usePaletteInPrompts: true,
        batchSize: 5,
        generateWithPalette: true
      }
    }

    const projects = projectUtils.getAllProjects()
    projects.push(project)
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))

    return project
  },

  // Get all projects
  getAllProjects: (): IconProject[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS)
      if (!stored) return []

      return JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }))
    } catch (error) {
      console.error('Failed to load projects:', error)
      return []
    }
  },

  // Get project by ID
  getProject: (id: string): IconProject | null => {
    const projects = projectUtils.getAllProjects()
    return projects.find(p => p.id === id) || null
  },

  // Update project
  updateProject: (project: IconProject): void => {
    const projects = projectUtils.getAllProjects()
    const index = projects.findIndex(p => p.id === project.id)

    if (index >= 0) {
      projects[index] = { ...project, updatedAt: new Date() }
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
    }
  },

  // Delete project
  deleteProject: (id: string): void => {
    const projects = projectUtils.getAllProjects()
    const filtered = projects.filter(p => p.id !== id)
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered))

    // Clear current project if it was deleted
    const currentProject = projectUtils.getCurrentProject()
    if (currentProject?.id === id) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT)
    }
  },

  // Set current project
  setCurrentProject: (project: IconProject): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(project))
  },

  // Get current project
  getCurrentProject: (): IconProject | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT)
      if (!stored) return null

      const project = JSON.parse(stored)
      return {
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt)
      }
    } catch (error) {
      console.error('Failed to load current project:', error)
      return null
    }
  },

  // Add icon to project
  addIconToProject: (projectId: string, generationResult: ImageGenerationResponse, prompt: string, name?: string): void => {
    const project = projectUtils.getProject(projectId)
    if (!project || !generationResult.success || !generationResult.imageUrl) return

    const icon: SavedIcon = {
      id: generateId(),
      name: name || `Icon ${project.icons.length + 1}`,
      prompt,
      imageUrl: generationResult.imageUrl,
      provider: generationResult.provider,
      model: generationResult.model,
      generatedAt: new Date(),
      cost: generationResult.cost,
      generationTime: generationResult.generationTime,
      tags: extractTagsFromPrompt(prompt)
    }

    project.icons.push(icon)
    projectUtils.updateProject(project)
  },

  // Remove icon from project
  removeIconFromProject: (projectId: string, iconId: string): void => {
    const project = projectUtils.getProject(projectId)
    if (!project) return

    project.icons = project.icons.filter(icon => icon.id !== iconId)
    projectUtils.updateProject(project)
  },

  // Export project data
  exportProject: (projectId: string): string => {
    const project = projectUtils.getProject(projectId)
    if (!project) throw new Error('Project not found')

    return JSON.stringify(project, null, 2)
  },

  // Import project data
  importProject: (projectData: string): IconProject => {
    try {
      const project = JSON.parse(projectData) as IconProject

      // Validate project structure
      if (!project.id || !project.name || !Array.isArray(project.icons)) {
        throw new Error('Invalid project format')
      }

      // Ensure backward compatibility
      if (!project.generationQueue) project.generationQueue = []
      if (!project.colorPalette) project.colorPalette = getDefaultPalette('fantasy')

      // Generate new ID to avoid conflicts
      project.id = generateId()
      project.createdAt = new Date()
      project.updatedAt = new Date()

      // Save imported project
      const projects = projectUtils.getAllProjects()
      projects.push(project)
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))

      return project
    } catch (error) {
      throw new Error('Failed to import project: ' + (error as Error).message)
    }
  },

  // Add item to generation queue
  addToQueue: (projectId: string, item: Omit<IconQueueItem, 'id' | 'createdAt' | 'status'>): void => {
    const project = projectUtils.getProject(projectId)
    if (!project) return

    const queueItem: IconQueueItem = {
      ...item,
      id: generateId(),
      createdAt: new Date(),
      status: 'pending'
    }

    project.generationQueue.push(queueItem)
    projectUtils.updateProject(project)
  },

  // Update queue item status
  updateQueueItem: (projectId: string, itemId: string, updates: Partial<IconQueueItem>): void => {
    const project = projectUtils.getProject(projectId)
    if (!project) return

    const itemIndex = project.generationQueue.findIndex(item => item.id === itemId)
    if (itemIndex >= 0) {
      project.generationQueue[itemIndex] = { ...project.generationQueue[itemIndex], ...updates }
      projectUtils.updateProject(project)
    }
  },

  // Remove item from queue
  removeFromQueue: (projectId: string, itemId: string): void => {
    const project = projectUtils.getProject(projectId)
    if (!project) return

    project.generationQueue = project.generationQueue.filter(item => item.id !== itemId)
    projectUtils.updateProject(project)
  },

  // Clear completed items from queue
  clearCompletedQueue: (projectId: string): void => {
    const project = projectUtils.getProject(projectId)
    if (!project) return

    project.generationQueue = project.generationQueue.filter(item =>
      item.status !== 'completed' && item.status !== 'failed'
    )
    projectUtils.updateProject(project)
  },

  // Update project color palette
  updatePalette: (projectId: string, palette: ColorPalette): void => {
    const project = projectUtils.getProject(projectId)
    if (!project) return

    project.colorPalette = palette
    projectUtils.updateProject(project)
  },

  // Generate prompt with palette colors
  enhancePromptWithPalette: (prompt: string, palette: ColorPalette): string => {
    if (!prompt) return prompt

    // Create very specific color constraints and usage instructions
    const colorConstraints = [
      `STRICT COLOR PALETTE: Use ONLY these exact hex colors`,
      `Primary ${palette.primary} for main subject/dominant elements`,
      `Secondary ${palette.secondary} for supporting elements and details`,
      `Accent ${palette.accent} for highlights, magical effects, and focal points`,
      `Background ${palette.background} for backgrounds and base surfaces`,
      `Text/border ${palette.text} for text and outlines`,
      `FORBIDDEN: Do not use any colors outside this palette`,
      `Shadows must be darker variants of these colors only`,
      `Highlights must be lighter variants of these colors only`
    ]

    // Add custom colors with specific usage
    if (palette.custom && palette.custom.length > 0) {
      palette.custom.forEach(customColor => {
        colorConstraints.push(`Special ${customColor.hex} for ${customColor.description || customColor.name}`)
      })
    }

    // Build directive prompt that forces color compliance
    const enhancedPrompt = `${prompt}. COLOR RESTRICTIONS: ${colorConstraints.join(', ')}.`

    return enhancedPrompt
  },

  // Enhance prompt with style injection
  enhancePromptWithStyle: (prompt: string, styleInjection: string): string => {
    if (!prompt || !styleInjection) return prompt
    return `${prompt}, ${styleInjection}`
  }
}

// Settings Management
export const settingsUtils = {
  getUserSettings: (): ProjectSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)
      if (!stored) return getDefaultSettings()

      return { ...getDefaultSettings(), ...JSON.parse(stored) }
    } catch (error) {
      console.error('Failed to load user settings:', error)
      return getDefaultSettings()
    }
  },

  saveUserSettings: (settings: Partial<ProjectSettings>): void => {
    const current = settingsUtils.getUserSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updated))
  },

  resetUserSettings: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS)
  }
}

// Recent Prompts Management
export const promptUtils = {
  getRecentPrompts: (): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_PROMPTS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load recent prompts:', error)
      return []
    }
  },

  addRecentPrompt: (prompt: string): void => {
    const prompts = promptUtils.getRecentPrompts()

    // Remove duplicate if exists
    const filtered = prompts.filter(p => p !== prompt)

    // Add to beginning and limit to 10 most recent
    filtered.unshift(prompt)
    const limited = filtered.slice(0, 10)

    localStorage.setItem(STORAGE_KEYS.RECENT_PROMPTS, JSON.stringify(limited))
  },

  clearRecentPrompts: (): void => {
    localStorage.removeItem(STORAGE_KEYS.RECENT_PROMPTS)
  }
}

// Utility Functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getDefaultSettings(): ProjectSettings {
  return {
    defaultProvider: 'google',
    defaultModel: 'gemini-2.5-flash-image',
    defaultQuality: 'standard',
    defaultStyle: 'vivid',
    autoSave: true,
    usePaletteInPrompts: true,
    batchSize: 5,
    generateWithPalette: true
  }
}

// Color Palette Presets
export function getDefaultPalette(theme: 'fantasy' | 'sci-fi' | 'modern' | 'nature' | 'custom' = 'fantasy'): ColorPalette {
  const palettes = {
    fantasy: {
      id: generateId(),
      name: 'Fantasy Adventure',
      primary: '#8B4513',      // Saddle Brown
      secondary: '#DAA520',    // Goldenrod
      background: '#F5F5DC',   // Beige
      surface: '#FFFAF0',      // Floral White
      accent: '#FF6347',       // Tomato
      text: '#2F4F4F',         // Dark Slate Gray
      textSecondary: '#696969', // Dim Gray
      border: '#D2B48C',       // Tan
      success: '#228B22',      // Forest Green
      warning: '#FF8C00',      // Dark Orange
      error: '#DC143C',        // Crimson
      custom: [
        { id: generateId(), name: 'Magic Purple', hex: '#9370DB', description: 'Mystical magic effects' },
        { id: generateId(), name: 'Dragon Red', hex: '#B22222', description: 'Fierce dragon colors' }
      ]
    },
    'sci-fi': {
      id: generateId(),
      name: 'Sci-Fi Future',
      primary: '#00BFFF',      // Deep Sky Blue
      secondary: '#7B68EE',    // Medium Slate Blue
      background: '#191970',   // Midnight Blue
      surface: '#2F4F4F',      // Dark Slate Gray
      accent: '#00FFFF',       // Cyan
      text: '#E0E0E0',         // Light Gray
      textSecondary: '#A9A9A9', // Dark Gray
      border: '#4682B4',       // Steel Blue
      success: '#00FF00',      // Lime
      warning: '#FFD700',      // Gold
      error: '#FF1493',        // Deep Pink
      custom: [
        { id: generateId(), name: 'Neon Green', hex: '#39FF14', description: 'High-tech displays' },
        { id: generateId(), name: 'Plasma Pink', hex: '#FF10F0', description: 'Energy weapons' }
      ]
    },
    modern: {
      id: generateId(),
      name: 'Modern Clean',
      primary: '#2563EB',      // Blue 600
      secondary: '#7C3AED',    // Violet 600
      background: '#FFFFFF',   // White
      surface: '#F8FAFC',      // Slate 50
      accent: '#F59E0B',       // Amber 500
      text: '#0F172A',         // Slate 900
      textSecondary: '#64748B', // Slate 500
      border: '#E2E8F0',       // Slate 200
      success: '#059669',      // Emerald 600
      warning: '#D97706',      // Amber 600
      error: '#DC2626',        // Red 600
      custom: [
        { id: generateId(), name: 'Tech Blue', hex: '#3B82F6', description: 'Modern technology' },
        { id: generateId(), name: 'Brand Purple', hex: '#8B5CF6', description: 'Premium branding' }
      ]
    },
    nature: {
      id: generateId(),
      name: 'Nature Harmony',
      primary: '#16A085',      // Teal
      secondary: '#27AE60',    // Emerald
      background: '#F0FFF0',   // Honeydew
      surface: '#F5FFFA',      // Mint Cream
      accent: '#FFB347',       // Peach
      text: '#2D4A22',         // Dark Green
      textSecondary: '#5D6D5D', // Gray Green
      border: '#98FB98',       // Pale Green
      success: '#228B22',      // Forest Green
      warning: '#FF8C00',      // Dark Orange
      error: '#CD5C5C',        // Indian Red
      custom: [
        { id: generateId(), name: 'Sky Blue', hex: '#87CEEB', description: 'Clear skies' },
        { id: generateId(), name: 'Earth Brown', hex: '#8B4513', description: 'Rich soil' }
      ]
    },
    custom: {
      id: generateId(),
      name: 'Custom Palette',
      primary: '#6366F1',      // Indigo 500
      secondary: '#8B5CF6',    // Violet 500
      background: '#FFFFFF',   // White
      surface: '#F9FAFB',      // Gray 50
      accent: '#F59E0B',       // Amber 500
      text: '#111827',         // Gray 900
      textSecondary: '#6B7280', // Gray 500
      border: '#D1D5DB',       // Gray 300
      success: '#10B981',      // Emerald 500
      warning: '#F59E0B',      // Amber 500
      error: '#EF4444',        // Red 500
      custom: []
    }
  }

  return palettes[theme]
}

function extractTagsFromPrompt(prompt: string): string[] {
  const commonTags = [
    'fantasy', 'sci-fi', 'medieval', 'modern', 'pixel', 'realistic', 'cartoon',
    'weapon', 'armor', 'magic', 'technology', 'nature', 'character', 'building',
    'vehicle', 'item', 'spell', 'monster', 'hero', 'villain'
  ]

  const lowerPrompt = prompt.toLowerCase()
  return commonTags.filter(tag => lowerPrompt.includes(tag))
}

// Browser Storage Utils
export const storageUtils = {
  isStorageAvailable: (): boolean => {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  },

  getStorageUsage: (): { used: number; total: number } => {
    if (!storageUtils.isStorageAvailable()) {
      return { used: 0, total: 0 }
    }

    let used = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    // Estimate total storage (usually 5-10MB for localStorage)
    const total = 5 * 1024 * 1024 // 5MB estimate

    return { used, total }
  },

  clearAllData: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}