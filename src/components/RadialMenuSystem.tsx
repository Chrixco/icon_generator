'use client'

import { useEffect, useState, useCallback } from 'react'
import { AIProvider, ImageQuality, ImageStyle } from '@/types/ai'
import { PROVIDERS } from '@/config/providers'
import { GameIconStyle } from './StyleSelector'

interface RadialMenuItemBase {
  id: string
  icon: string
  label: string
  color?: string
  description?: string
}

interface SimpleMenuItem extends RadialMenuItemBase {
  action: () => void
}

interface ProviderMenuItem extends RadialMenuItemBase {
  provider: AIProvider
}

interface QualityMenuItem extends RadialMenuItemBase {
  quality: ImageQuality
}

interface StyleMenuItem extends RadialMenuItemBase {
  style: GameIconStyle
}

type RadialMenuItem = SimpleMenuItem | ProviderMenuItem | QualityMenuItem | StyleMenuItem

interface RadialMenuProps {
  isOpen: boolean
  centerIcon: string
  centerLabel: string
  items: RadialMenuItem[]
  onClose: () => void
  onItemSelect?: (item: RadialMenuItem) => void
  x?: number
  y?: number
  menuType?: 'simple' | 'provider' | 'quality' | 'style'
  maxItems?: number
}

export default function RadialMenuSystem({
  isOpen,
  centerIcon,
  centerLabel,
  items,
  onClose,
  onItemSelect,
  x = window.innerWidth / 2,
  y = window.innerHeight / 2,
  menuType = 'simple',
  maxItems = 8
}: RadialMenuProps) {
  const [mounted, setMounted] = useState(false)
  const [animatedItems, setAnimatedItems] = useState<boolean[]>([])

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      document.body.style.overflow = 'hidden'

      // Staggered animation for items
      setAnimatedItems(new Array(items.length).fill(false))
      const timer = setTimeout(() => {
        items.forEach((_, index) => {
          setTimeout(() => {
            setAnimatedItems(prev => {
              const newState = [...prev]
              newState[index] = true
              return newState
            })
          }, index * 100)
        })
      }, 200)

      return () => clearTimeout(timer)
    } else {
      document.body.style.overflow = 'unset'
      const timer = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, items.length])

  const handleItemClick = useCallback((item: RadialMenuItem) => {
    if ('action' in item) {
      item.action()
    }
    if (onItemSelect) {
      onItemSelect(item)
    }
    onClose()
  }, [onItemSelect, onClose])

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      onClose()
    }
  }, [isOpen, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [handleEscapeKey])

  if (!mounted) return null

  const radius = Math.min(150, Math.min(window.innerWidth, window.innerHeight) * 0.2)
  const angleStep = (2 * Math.PI) / Math.min(items.length, maxItems)
  const displayItems = items.slice(0, maxItems)

  return (
    <div
      className={`fixed inset-0 z-[300] transition-all duration-500 ${
        isOpen ? 'bg-transparent' : 'pointer-events-none'
      }`}
      onClick={onClose}
    >
      {/* Circular Gradient Background */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: isOpen
            ? `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.8) 100%)`
            : 'transparent'
        }}
      />

      {/* Menu Container */}
      <div
        className={`absolute transition-all duration-500 transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
        style={{
          left: x - 50,
          top: y - 50,
          transformOrigin: '50px 50px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Center Hub */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-warmwood-400 via-warmwood-500 to-warmwood-700 rounded-full shadow-2xl flex items-center justify-center text-white border-4 border-cream-100 z-20 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-3xl mb-1">{centerIcon}</div>
            <div className="text-xs font-bold opacity-90 leading-tight">{centerLabel}</div>
          </div>
        </div>

        {/* Radial Items */}
        {displayItems.map((item, index) => {
          const angle = index * angleStep - Math.PI / 2
          const itemX = Math.cos(angle) * radius
          const itemY = Math.sin(angle) * radius

          return (
            <div
              key={item.id}
              className={`absolute w-20 h-20 transition-all duration-${400 + index * 50} transform ${
                isOpen && animatedItems[index] ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
              style={{
                left: 50 + itemX - 40,
                top: 50 + itemY - 40,
                transitionDelay: `${index * 80}ms`
              }}
            >
              {/* Connection Line */}
              <div
                className={`absolute w-1 bg-gradient-to-r from-warmwood-300 via-warmwood-400 to-transparent transition-all duration-600 ${
                  isOpen && animatedItems[index] ? 'opacity-40' : 'opacity-0'
                }`}
                style={{
                  left: '50%',
                  top: '50%',
                  height: Math.sqrt(itemX * itemX + itemY * itemY) - 70,
                  transformOrigin: 'top center',
                  transform: `translate(-50%, -50%) rotate(${angle + Math.PI / 2}rad)`,
                  transitionDelay: `${300 + index * 50}ms`
                }}
              />

              {/* Menu Item Button */}
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full h-full rounded-full shadow-2xl flex items-center justify-center text-white font-bold hover:scale-110 active:scale-95 transition-all duration-200 border-3 border-cream-100 group ${
                  item.color || 'bg-gradient-to-br from-sage-500 via-sage-600 to-sage-700'
                } hover:shadow-3xl backdrop-blur-sm`}
                title={item.description || item.label}
              >
                <div className="text-center relative">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-xs opacity-90 leading-tight font-medium">
                    {item.label}
                  </div>

                  {/* Hover Tooltip */}
                  {item.description && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap backdrop-blur-sm z-30">
                      {item.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          )
        })}

        {/* More Items Indicator */}
        {items.length > maxItems && (
          <div className="absolute bottom-[-120px] left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
            +{items.length - maxItems} more options
          </div>
        )}
      </div>
    </div>
  )
}

// Utility functions to create menu items
export const createSimpleMenuItem = (
  id: string,
  icon: string,
  label: string,
  action: () => void,
  color?: string,
  description?: string
): SimpleMenuItem => ({
  id,
  icon,
  label,
  action,
  color,
  description
})

export const createProviderMenuItem = (
  provider: AIProvider,
  icon: string,
  label: string,
  color?: string,
  description?: string
): ProviderMenuItem => ({
  id: provider,
  icon,
  label,
  provider,
  color,
  description
})

export const createQualityMenuItem = (
  quality: ImageQuality,
  icon: string,
  label: string,
  color?: string,
  description?: string
): QualityMenuItem => ({
  id: quality,
  icon,
  label,
  quality,
  color,
  description
})

export const createStyleMenuItem = (
  style: GameIconStyle,
  icon: string,
  label: string,
  color?: string,
  description?: string
): StyleMenuItem => ({
  id: style.name,
  icon,
  label,
  style,
  color,
  description
})