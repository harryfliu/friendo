'use client'

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
  const iconConfig = getIconConfig(friend.closeness)

  const getIconElement = () => {
    const { shape, color, size } = iconConfig
    const colorClass = `text-${color}-500`
    const sizePx = `${size}px`

    switch (shape) {
      case 'dot':
        return (
          <circle
            cx="0"
            cy="0"
            r={size / 2}
            className={colorClass}
            fill="currentColor"
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
            className={colorClass}
            fill="currentColor"
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
            className={colorClass}
            fill="currentColor"
          />
        )
      
      case 'flower':
        return (
          <g className={colorClass} fill="currentColor">
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i * Math.PI) / 4
              const x = (size / 2) * Math.cos(angle)
              const y = (size / 2) * Math.sin(angle)
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={size / 8}
                />
              )
            })}
            <circle cx="0" cy="0" r={size / 6} />
          </g>
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
            className={colorClass}
            fill="currentColor"
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
            className={colorClass}
            fill="currentColor"
          />
        )
      
      default:
        return (
          <circle
            cx="0"
            cy="0"
            r={size / 2}
            className="text-gray-500"
            fill="currentColor"
          />
        )
    }
  }

  return (
    <motion.g
      className={`friend-icon ${isSelected ? 'selected' : ''}`}
      style={{
        transform: `translate(${friend.position.x}px, ${friend.position.y}px)`,
      }}
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
      onClick={onClick}
    >
      {getIconElement()}
      
      {/* Friend name label */}
      <motion.text
        x="0"
        y={iconConfig.size / 2 + 16}
        textAnchor="middle"
        className="text-xs font-medium fill-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: isSelected ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {friend.name}
      </motion.text>
    </motion.g>
  )
}
