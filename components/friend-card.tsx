'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, MapPin, Calendar, Trash2 } from 'lucide-react'
import { formatCloseness, getClosenessColor, getClosenessBarColor } from '@/lib/utils'
import { useOrbitStore } from '@/lib/store'
import type { Friend } from '@/lib/types'
import { ANIMATION_CONFIG } from '@/lib/constants'

// Helper function to get icon explanation
function getIconExplanation(closeness: number): string {
  if (closeness < 2) return 'Blue dot - Very distant';
  if (closeness < 4) return 'Teal square - Distant';
  if (closeness < 6) return 'Green hexagon - Moderate';
  if (closeness < 7.5) return 'Yellow diamond - Close';
  if (closeness < 9) return 'Orange star - Very close';
  return 'Red star - Closest';
}

// Simple icon preview component
function FriendIconPreview({ iconKey }: { iconKey: string }) {
  const [shape, color] = iconKey.split('-');
  const colorMap: { [key: string]: string } = {
    'blue': '#3b82f6',
    'teal': '#14b8a6', 
    'green': '#22c55e',
    'yellow': '#eab308',
    'orange': '#f97316',
    'red': '#ef4444'
  };
  
  const fillColor = colorMap[color] || '#6b7280';
  
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className="inline-block">
      {shape === 'dot' && <circle cx="16" cy="16" r="8" fill={fillColor} />}
      {shape === 'square' && <rect x="8" y="8" width="16" height="16" fill={fillColor} />}
      {shape === 'hexagon' && <polygon points="16,4 24,8 24,16 16,20 8,16 8,8" fill={fillColor} />}
      {shape === 'diamond' && <polygon points="16,4 24,16 16,28 8,16" fill={fillColor} />}
      {shape === 'star8' && <polygon points="16,4 20,12 28,12 22,18 24,26 16,22 8,26 10,18 4,12 12,12" fill={fillColor} />}
      {shape === 'star12' && <polygon points="16,2 20,8 26,8 22,14 24,20 16,16 8,20 10,14 6,8 12,8" fill={fillColor} />}
    </svg>
  );
}

interface FriendCardProps {
  friend: Friend
  onClose: () => void
  friendsCount: number
}

export function FriendCard({ friend, onClose, friendsCount }: FriendCardProps) {
  console.log('📊 FriendCard received friend:', { 
    name: friend.name, 
    closeness: friend.closeness,
    id: friend.id 
  })
  
  const { removeFriend } = useOrbitStore()
  
  const location = [friend.city, friend.state, friend.country]
    .filter(Boolean)
    .join(', ') || 'Location not set'

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${friend.name} from your orbit?`)) {
      removeFriend(friend.id)
      onClose()
    }
  }

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
                      {friendsCount >= 5 ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">closeness:</span>
                          <span className={`font-semibold ${getClosenessColor(friend.closeness)}`}>
                            {formatCloseness(friend.closeness)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Add {5 - friendsCount} more friends to see closeness scores
                        </div>
                      )}
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title={`Delete ${friend.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                added {new Date(friend.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Closeness visualization - only show after 5 friends */}
            {friendsCount >= 5 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">closeness level</span>
                  <span className="font-medium">{formatCloseness(friend.closeness)}/10</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ 
                      backgroundColor: getClosenessBarColor(friend.closeness)
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(friend.closeness / 10) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>
            )}

            {/* Icon preview */}
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">icon shape</div>
                <div 
                  className="inline-block cursor-help" 
                  title={`${friend.iconKey} - Shape and color based on closeness level (${friend.closeness.toFixed(1)}/10)`}
                >
                  <FriendIconPreview iconKey={friend.iconKey} />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {getIconExplanation(friend.closeness)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
