'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { getIconConfig } from '@/lib/rating/insert'
import type { FriendWithPosition } from '@/lib/types'
import { ANIMATION_CONFIG } from '@/lib/constants'

interface FriendIconProps {
  friend: FriendWithPosition
  isSelected: boolean
  onClick: () => void
}

export function FriendIcon({ friend, isSelected, onClick }: FriendIconProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Use the stored iconKey instead of recalculating from closeness
  const iconKey = friend.iconKey
  const [shape, color] = iconKey.split('-')
  
  // Map color names to Tailwind color classes
  const colorMap: Record<string, string> = {
    'blue': 'blue',
    'teal': 'teal', 
    'green': 'green',
    'yellow': 'yellow',
    'orange': 'orange',
    'red': 'red'
  }
  
  const tailwindColor = colorMap[color] || 'gray'
  
  const iconConfig = {
    shape: shape as 'dot' | 'square' | 'hexagon' | 'diamond' | 'star8' | 'star12',
    color: tailwindColor,
    size: Math.max(12, Math.min(24, 12 + (friend.closeness / 10) * 12))
  }

  const getIconElement = () => {
    const { shape, color, size } = iconConfig
    const sizePx = `${size}px`
    
    // Use direct color values instead of Tailwind classes
    const colorMap: Record<string, string> = {
      'blue': '#3b82f6',    // blue-500
      'teal': '#14b8a6',    // teal-500
      'green': '#22c55e',   // green-500
      'yellow': '#eab308',  // yellow-500
      'orange': '#f97316',  // orange-500
      'red': '#ef4444'      // red-500
    }
    
    const fillColor = colorMap[color] || '#6b7280' // gray-500 fallback
    
    console.log('🎨 Icon debug:', { 
      friendName: friend.name, 
      closeness: friend.closeness,
      iconKey: friend.iconKey,
      shape, 
      color, 
      fillColor, 
      size 
    })

    switch (shape) {
      case 'dot':
        return (
          <circle
            cx="0"
            cy="0"
            r={size / 2}
            fill={fillColor}
          />
        )
      
      case 'square':
        return (
          <rect
            x={-size / 2}
            y={-size / 2}
            width={size}
            height={size}
            rx={size / 6}
            fill={fillColor}
          />
        )
      
      case 'hexagon':
        const hexPoints = Array.from({ length: 6 }, (_, i) => {
          const angle = (i * Math.PI) / 3
          const x = (size / 2) * Math.cos(angle)
          const y = (size / 2) * Math.sin(angle)
          return `${x},${y}`
        }).join(' ')
        return (
          <polygon
            points={hexPoints}
            fill={fillColor}
          />
        )
      
      case 'diamond':
        return (
          <polygon
            points={`0,${-size/2} ${size/2},0 0,${size/2} ${-size/2},0`}
            fill={fillColor}
          />
        )
      
      case 'star8':
        const star8Points = Array.from({ length: 16 }, (_, i) => {
          const angle = (i * Math.PI) / 8
          const radius = i % 2 === 0 ? size / 2 : size / 4
          const x = radius * Math.cos(angle)
          const y = radius * Math.sin(angle)
          return `${x},${y}`
        }).join(' ')
        return (
          <polygon
            points={star8Points}
            fill={fillColor}
          />
        )
      
      case 'star12':
        const star12Points = Array.from({ length: 24 }, (_, i) => {
          const angle = (i * Math.PI) / 12
          const radius = i % 2 === 0 ? size / 2 : size / 4
          const x = radius * Math.cos(angle)
          const y = radius * Math.sin(angle)
          return `${x},${y}`
        }).join(' ')
        return (
          <polygon
            points={star12Points}
            fill={fillColor}
          />
        )
      
      default:
        return (
          <circle
            cx="0"
            cy="0"
            r={size / 2}
            fill="#6b7280"
          />
        )
    }
  }



  return (
    <g transform={`translate(${friend.position.x}, ${friend.position.y})`}>
      <motion.g
        className={`friend-icon ${isSelected ? 'selected' : ''}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: isSelected ? 1.2 : 1,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: ANIMATION_CONFIG.spring.stiffness,
          damping: ANIMATION_CONFIG.spring.damping,
          mass: ANIMATION_CONFIG.spring.mass,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {getIconElement()}
        
        {/* Friend name label - shows on hover or when selected */}
        <motion.text
          x="0"
          y={iconConfig.size / 2 + 16}
          textAnchor="middle"
          className="text-xs font-medium fill-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: (isSelected || isHovered) ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none'
          }}
        >
          {friend.name}
        </motion.text>
      </motion.g>
    </g>
  )
}
