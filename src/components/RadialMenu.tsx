'use client'

import { useEffect, useState } from 'react'

interface RadialMenuItem {
  icon: string
  label: string
  action: () => void
  color?: string
}

interface RadialMenuProps {
  isOpen: boolean
  centerIcon: string
  centerLabel: string
  items: RadialMenuItem[]
  onClose: () => void
  x?: number
  y?: number
}

export default function RadialMenu({
  isOpen,
  centerIcon,
  centerLabel,
  items,
  onClose,
  x = 0,
  y = 0
}: RadialMenuProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      const timer = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted) return null

  const radius = 120
  const angleStep = (2 * Math.PI) / items.length

  return (
    <div
      className={`fixed inset-0 z-[200] transition-all duration-300 ${
        isOpen ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
      }`}
      onClick={onClose}
    >
      {/* Menu Container */}
      <div
        className={`absolute transition-all duration-300 transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
        style={{
          left: x - 40,
          top: y - 40,
          transformOrigin: '40px 40px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Center Button */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-warmwood-500 to-warmwood-700 rounded-full shadow-2xl flex items-center justify-center text-white border-4 border-cream-100 z-10">
          <div className="text-center">
            <div className="text-2xl mb-1">{centerIcon}</div>
            <div className="text-xs font-medium opacity-90">{centerLabel}</div>
          </div>
        </div>

        {/* Radial Items */}
        {items.map((item, index) => {
          const angle = index * angleStep - Math.PI / 2 // Start from top
          const itemX = Math.cos(angle) * radius
          const itemY = Math.sin(angle) * radius

          return (
            <div
              key={index}
              className={`absolute w-16 h-16 transition-all duration-${300 + index * 50} transform ${
                isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`}
              style={{
                left: 40 + itemX - 32,
                top: 40 + itemY - 32,
                transitionDelay: `${index * 50}ms`
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  item.action()
                  onClose()
                }}
                className={`w-full h-full rounded-full shadow-xl flex items-center justify-center text-white font-medium hover:scale-110 transition-all border-3 border-cream-100 ${
                  item.color || 'bg-gradient-to-br from-sage-500 to-sage-700'
                } hover:shadow-2xl`}
                title={item.label}
              >
                <div className="text-center">
                  <div className="text-xl mb-0.5">{item.icon}</div>
                  <div className="text-xs opacity-90 leading-tight">{item.label}</div>
                </div>
              </button>

              {/* Connection Line */}
              <div
                className={`absolute w-0.5 bg-gradient-to-r from-warmwood-400 to-transparent transition-all duration-500 ${
                  isOpen ? 'opacity-60' : 'opacity-0'
                }`}
                style={{
                  left: '50%',
                  top: '50%',
                  height: Math.sqrt(itemX * itemX + itemY * itemY) - 60,
                  transformOrigin: 'top center',
                  transform: `translate(-50%, -50%) rotate(${angle + Math.PI / 2}rad)`,
                  transitionDelay: `${200 + index * 30}ms`
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}