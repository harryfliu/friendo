'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, MapPin, Calendar } from 'lucide-react'
import { formatCloseness, getClosenessColor } from '@/lib/utils'
import type { Friend } from '@/lib/types'
import { ANIMATION_CONFIG } from '@/lib/constants'

interface FriendCardProps {
  friend: Friend
  onClose: () => void
}

export function FriendCard({ friend, onClose }: FriendCardProps) {
  const location = [friend.city, friend.state, friend.country]
    .filter(Boolean)
    .join(', ') || 'Location not set'

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Card */}
      <motion.div
        className="relative w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{
          type: "spring",
          stiffness: ANIMATION_CONFIG.spring.stiffness,
          damping: ANIMATION_CONFIG.spring.damping,
          mass: ANIMATION_CONFIG.spring.mass,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{friend.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">closeness:</span>
                  <span className={`font-semibold ${getClosenessColor(friend.closeness)}`}>
                    {formatCloseness(friend.closeness)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Location */}
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{location}</span>
            </div>

            {/* Added date */}
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                added {friend.createdAt.toLocaleDateString()}
              </span>
            </div>

            {/* Closeness visualization */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">closeness level</span>
                <span className="font-medium">{formatCloseness(friend.closeness)}/10</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getClosenessColor(friend.closeness).replace('text-', 'bg-')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(friend.closeness / 10) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Icon preview */}
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">icon shape</div>
                <div className={`inline-block ${getClosenessColor(friend.closeness)}`}>
                  {/* This would render the actual icon shape */}
                  <div className="w-8 h-8 rounded-full bg-current opacity-60" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
