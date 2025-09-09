'use client'

import { useState, useEffect } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useOrbitStore } from '@/lib/store'
import { insertWithComparisons } from '@/lib/rating/insert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { Friend } from '@/lib/types'
import { ANIMATION_CONFIG, GESTURE_CONFIG } from '@/lib/constants'

interface RatingInterfaceProps {
  candidate: Friend
}

export function RatingInterface({ candidate }: RatingInterfaceProps) {
  const { 
    friends, 
    endRating, 
    updateRatingProgress,
    setFriends 
  } = useOrbitStore()
  
  const [currentPivot, setCurrentPivot] = useState<Friend | null>(null)
  const [comparisons, setComparisons] = useState(0)
  const [maxComparisons, setMaxComparisons] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)

  // Initialize rating process
  useEffect(() => {
    const sortedFriends = [...friends].sort((a, b) => b.closeness - a.closeness)
    const max = Math.min(Math.ceil(Math.log2(sortedFriends.length)) + 1, 9)
    setMaxComparisons(max)
    updateRatingProgress(0, max)
    
    if (sortedFriends.length > 0) {
      setCurrentPivot(sortedFriends[Math.floor(sortedFriends.length / 2)])
    }
  }, [friends, updateRatingProgress])

  const handleComparison = async (result: -1 | 1) => {
    if (!currentPivot || isProcessing) return

    setIsProcessing(true)
    setComparisons(prev => prev + 1)
    updateRatingProgress(comparisons + 1, maxComparisons)

    try {
      const sortedFriends = [...friends].sort((a, b) => b.closeness - a.closeness)
      const { newSorted } = await insertWithComparisons({
        sorted: sortedFriends,
        candidate,
        compare: async (candidate, pivot) => {
          // Simulate user comparison - in real app this would be the actual comparison
          return result
        },
        maxComparisons,
      })

      setFriends(newSorted)
      
      // Move to next comparison or finish
      if (comparisons + 1 < maxComparisons) {
        const nextPivot = newSorted[Math.floor(newSorted.length / 2)]
        setCurrentPivot(nextPivot)
      } else {
        endRating()
      }
    } catch (error) {
      console.error('Rating error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSwipe = (event: any, info: PanInfo) => {
    const { offset, velocity } = info
    
    if (Math.abs(offset.x) > GESTURE_CONFIG.swipeThreshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0) {
        handleComparison(1) // Swipe right = more close
      } else {
        handleComparison(-1) // Swipe left = less close
      }
    }
    
    setSwipeOffset(0)
  }

  const handleSwipeMove = (event: any, info: PanInfo) => {
    setSwipeOffset(Math.max(-100, Math.min(100, info.offset.x)))
  }

  if (!currentPivot) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">rating complete!</h2>
          <p className="text-muted-foreground mb-4">
            {candidate.name} has been added to your orbit.
          </p>
          <Button onClick={endRating}>continue</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>comparison {comparisons + 1} of {maxComparisons}</span>
            <span>{Math.round(((comparisons + 1) / maxComparisons) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((comparisons + 1) / maxComparisons) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              who are you closer to?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              swipe or use buttons to compare
            </p>
          </CardContent>
        </Card>

        {/* Comparison cards */}
        <div className="space-y-4">
          {/* Candidate card */}
          <motion.div
            className="rating-card rounded-lg p-4 border-2 border-primary"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDrag={handleSwipeMove}
            onDragEnd={handleSwipe}
            style={{
              '--swipe-x': `${swipeOffset}px`,
            } as React.CSSProperties}
            animate={{
              x: swipeOffset,
              opacity: 1 - Math.abs(swipeOffset) / 100,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{candidate.name}</h3>
              <p className="text-sm text-muted-foreground">new friend</p>
            </div>
          </motion.div>

          {/* vs */}
          <div className="text-center text-muted-foreground font-medium">vs</div>

          {/* Pivot card */}
          <motion.div
            className="rating-card rounded-lg p-4 border-2 border-secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{currentPivot.name}</h3>
              <p className="text-sm text-muted-foreground">
                closeness: {currentPivot.closeness.toFixed(1)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <Button
            variant="outline"
            onClick={() => handleComparison(-1)}
            disabled={isProcessing}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>less close</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleComparison(1)}
            disabled={isProcessing}
            className="flex items-center space-x-2"
          >
            <span>more close</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Cancel button */}
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            onClick={endRating}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            cancel
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p className="hidden md:block">
            use ← → arrow keys or click buttons
          </p>
          <p className="md:hidden">
            swipe left/right or tap buttons
          </p>
        </div>
      </div>
    </div>
  )
}
