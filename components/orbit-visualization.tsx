'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import { useOrbitStore } from '@/lib/store'
import { FriendIcon } from './friend-icon'
import type { FriendWithPosition, RingLayout } from '@/lib/types'
import { ANIMATION_CONFIG } from '@/lib/constants'

interface OrbitVisualizationProps {
  friends: FriendWithPosition[]
  ringLayout: RingLayout | null
  onFriendSelect: (friend: FriendWithPosition) => void
  dimensions: { width: number; height: number }
}

export function OrbitVisualization({ 
  friends, 
  ringLayout, 
  onFriendSelect,
  dimensions
}: OrbitVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { selectedFriend } = useOrbitStore()

  // Set up D3 zoom behavior
  useEffect(() => {
    if (!svgRef.current || !ringLayout) return

    const svg = d3.select(svgRef.current)
    const g = svg.select('.orbit-group')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString())
      })

    svg.call(zoom)

    return () => {
      svg.on('.zoom', null)
    }
  }, [ringLayout])

  if (!ringLayout || dimensions.width === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">computing orbit layout...</p>
        </div>
      </div>
    )
  }

  const centerX = dimensions.width / 2
  const centerY = dimensions.height / 2
  

  return (
    <div className="w-full h-full relative">
      <svg
        ref={svgRef}
        className="w-full h-full orbit-container"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <defs>
          {/* Super cool animated gradient for the user icon */}
          <radialGradient id="userGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6">
              <animate attributeName="stop-color" 
                values="#8b5cf6;#a855f7;#c084fc;#e879f9;#f59e0b;#ef4444;#8b5cf6" 
                dur="8s" 
                repeatCount="indefinite" />
            </stop>
            <stop offset="30%" stopColor="#a855f7">
              <animate attributeName="stop-color" 
                values="#a855f7;#c084fc;#e879f9;#f59e0b;#ef4444;#8b5cf6;#a855f7" 
                dur="8s" 
                repeatCount="indefinite" />
            </stop>
            <stop offset="60%" stopColor="#c084fc">
              <animate attributeName="stop-color" 
                values="#c084fc;#e879f9;#f59e0b;#ef4444;#8b5cf6;#a855f7;#c084fc" 
                dur="8s" 
                repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#e879f9">
              <animate attributeName="stop-color" 
                values="#e879f9;#f59e0b;#ef4444;#8b5cf6;#a855f7;#c084fc;#e879f9" 
                dur="8s" 
                repeatCount="indefinite" />
            </stop>
          </radialGradient>
        </defs>
        <g className="orbit-group">
          {/* Render rings */}
          {ringLayout.radii.map((radius, index) => (
            <motion.circle
              key={index}
              cx={centerX}
              cy={centerY}
              r={radius}
              className="ring"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{
                duration: ANIMATION_CONFIG.durations.normal / 1000,
                delay: index * 0.05,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Center user icon - super cool animated version */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ pointerEvents: 'none' }}
          >
            {/* Outer glow ring */}
            <motion.circle
              cx={centerX}
              cy={centerY}
              r="20"
              fill="none"
              stroke="url(#userGradient)"
              strokeWidth="1.5"
              opacity="0.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: [0, 0.6, 0.5]
              }}
              transition={{ 
                duration: 1.5, 
                ease: "easeOut",
                delay: 0.3
              }}
            />
            
            {/* Pulsing inner ring */}
            <motion.circle
              cx={centerX}
              cy={centerY}
              r="15"
              fill="none"
              stroke="url(#userGradient)"
              strokeWidth="1"
              opacity="0.3"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main user icon - animated diamond/star */}
            <motion.g
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {/* Circle shape */}
              <motion.circle
                cx={centerX}
                cy={centerY}
                r="12"
                fill="url(#userGradient)"
                stroke="url(#userGradient)"
                strokeWidth="0.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              />
              
              {/* Inner sparkle */}
              <motion.circle
                cx={centerX}
                cy={centerY}
                r="3"
                fill="white"
                opacity="0.8"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.g>
            
            {/* Floating particles around the center */}
            {Array.from({ length: 4 }, (_, i) => {
              const angle = (i * Math.PI) / 2
              const radius = 25
              const x = centerX + radius * Math.cos(angle)
              const y = centerY + radius * Math.sin(angle)
              
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="url(#userGradient)"
                  opacity="0.6"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0.8, 1],
                    opacity: [0, 0.6, 0.3, 0.6]
                  }}
                  transition={{ 
                    duration: 2 + i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1
                  }}
                >
                  <animate attributeName="fill" 
                    values="url(#userGradient);#f59e0b;#ef4444;#22c55e;#3b82f6;url(#userGradient)" 
                    dur="6s" 
                    repeatCount="indefinite" 
                    begin={`${i * 0.5}s`} />
                </motion.circle>
              )
            })}
          </motion.g>

          {/* Render friends */}
          {friends.map((friend) => (
            <FriendIcon
              key={friend.id}
              friend={friend}
              isSelected={selectedFriend?.id === friend.id}
              onClick={() => {
                console.log('🔍 Clicking friend:', { 
                  name: friend.name, 
                  closeness: friend.closeness,
                  id: friend.id 
                })
                onFriendSelect(friend)
              }}
            />
          ))}
        </g>
      </svg>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-muted-foreground">
          <p className="hidden md:block">
            Use mouse wheel to zoom • Drag to pan • Click friends to view details
          </p>
          <p className="md:hidden">
            Pinch to zoom • Drag to pan • Tap friends to view details
          </p>
        </div>
      </div>
    </div>
  )
}
