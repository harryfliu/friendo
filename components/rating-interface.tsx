'use client'

import { useState, useEffect } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useOrbitStore } from '@/lib/store'
import { insertWithComparisons, generateIconKey } from '@/lib/rating/insert'
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
  const [binarySearchState, setBinarySearchState] = useState<{
    lo: number
    hi: number
    sortedFriends: Friend[]
  } | null>(null)

  const handleComparison = async (result: -1 | 1) => {
    if (!currentPivot || isProcessing || !binarySearchState) return

    setIsProcessing(true)
    setComparisons(prev => prev + 1)
    updateRatingProgress(comparisons + 1, maxComparisons)

    try {
      const { lo, hi, sortedFriends } = binarySearchState
      const mid = Math.floor((lo + hi) / 2)
      
      // Update binary search bounds based on comparison result
      let newLo = lo
      let newHi = hi
      
      if (result < 0) {
        // candidate is less close, search right half
        newLo = mid + 1
      } else {
        // candidate is more close, search left half  
        newHi = mid - 1
      }

      // Check if we're done with binary search
      if (newLo > newHi || comparisons + 1 >= maxComparisons) {
        // Insert candidate at the correct position
        const insertAt = newLo
        const newSorted = [...sortedFriends]
        newSorted.splice(insertAt, 0, candidate)
        
        // Apply Beli-style relative scoring: closest friend gets 10, others scale down
        const friendsWithRelativeScores = newSorted.map((friend, index) => {
          const totalFriends = newSorted.length
          // Scale from 0-10 where index 0 (closest) gets 10, index n-1 (furthest) gets 0
          const relativeScore = totalFriends > 1 
            ? (totalFriends - 1 - index) / (totalFriends - 1) * 10
            : 10 // If only one friend, they get 10
          
          return {
            ...friend,
            closeness: relativeScore,
            iconKey: generateIconKey(relativeScore)
          }
        })
        
        // Update friends and finish
        setFriends(friendsWithRelativeScores)
        endRating()
      } else {
        // Continue with next comparison
        const nextPivot = sortedFriends[Math.floor((newLo + newHi) / 2)]
        setCurrentPivot(nextPivot)
        setBinarySearchState({
          lo: newLo,
          hi: newHi,
          sortedFriends
        })
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

  // Initialize rating process
  useEffect(() => {
    // Filter out the candidate from friends to avoid self-comparison
    const existingFriends = friends.filter(friend => friend.id !== candidate.id)
    const sortedFriends = [...existingFriends].sort((a, b) => b.closeness - a.closeness)
    const max = Math.min(Math.ceil(Math.log2(sortedFriends.length)) + 1, 9)
    setMaxComparisons(max)
    updateRatingProgress(0, max)
    
    if (sortedFriends.length > 0) {
      const lo = 0
      const hi = sortedFriends.length - 1
      const mid = Math.floor((lo + hi) / 2)
      
      setCurrentPivot(sortedFriends[mid])
      setBinarySearchState({
        lo,
        hi,
        sortedFriends
      })
    }
  }, [friends, candidate.id, updateRatingProgress])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isProcessing || !currentPivot) return
      
      if (event.key === 'ArrowLeft') {
        handleComparison(-1)
      } else if (event.key === 'ArrowRight') {
        handleComparison(1)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isProcessing, currentPivot, handleComparison])

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
              click on the friend you're closer to, or use arrow keys
            </p>
          </CardContent>
        </Card>

        {/* Comparison cards - side by side */}
        <div className="flex items-center justify-center space-x-8 my-8">
          {/* Left friend - Candidate */}
          <motion.div
            className="rating-card rounded-lg p-6 border-2 border-primary cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors"
            onClick={() => handleComparison(1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">{candidate.name}</h3>
              <p className="text-sm text-muted-foreground">new friend</p>
            </div>
          </motion.div>

          {/* VS divider */}
          <div className="text-center text-muted-foreground font-bold text-lg">VS</div>

          {/* Right friend - Existing */}
          <motion.div
            className="rating-card rounded-lg p-6 border-2 border-secondary cursor-pointer bg-secondary/5 hover:bg-secondary/10 transition-colors"
            onClick={() => handleComparison(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">{currentPivot.name}</h3>
              <p className="text-sm text-muted-foreground">
                closeness: {currentPivot.closeness.toFixed(1)}
              </p>
            </div>
          </motion.div>
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
