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

          {/* Render friends */}
          {friends.map((friend) => (
            <FriendIcon
              key={friend.id}
              friend={friend}
              isSelected={selectedFriend?.id === friend.id}
              onClick={() => onFriendSelect(friend)}
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
