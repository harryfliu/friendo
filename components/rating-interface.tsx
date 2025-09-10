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
    setFriends,
    theme
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

  // Helper function to apply tie-aware relative scoring
  const applyTieAwareScoring = (sortedFriends: Friend[]) => {
    const friendsWithScores = [...sortedFriends]
    
    console.log('🔍 DEBUG: Starting tie-aware scoring with friends:', friendsWithScores.map(f => ({ name: f.name, closeness: f.closeness })))
    
    // Group friends by their current closeness scores (with tolerance for floating point precision)
    const scoreGroups: { [key: string]: Friend[] } = {}
    
    friendsWithScores.forEach(friend => {
      const scoreKey = friend.closeness.toFixed(2) // Round to 2 decimal places for grouping
      if (!scoreGroups[scoreKey]) {
        scoreGroups[scoreKey] = []
      }
      scoreGroups[scoreKey].push(friend)
    })
    
    console.log('🔍 DEBUG: Score groups:', Object.entries(scoreGroups).map(([score, friends]) => ({
      score: parseFloat(score),
      friends: friends.map(f => f.name)
    })))
    
    // Calculate new scores for each group
    const sortedGroups = Object.values(scoreGroups).sort((a, b) => b[0].closeness - a[0].closeness)
    
    console.log('🔍 DEBUG: Sorted groups (highest to lowest):', sortedGroups.map(group => ({
      originalScore: group[0].closeness,
      friends: group.map(f => f.name)
    })))
    
    const result: Friend[] = []
    
    sortedGroups.forEach((group, groupIndex) => {
      const totalGroups = sortedGroups.length
      const groupScore = totalGroups > 1 
        ? (totalGroups - 1 - groupIndex) / (totalGroups - 1) * 10
        : 10
      
      console.log(`🔍 DEBUG: Group ${groupIndex + 1}/${totalGroups} gets score ${groupScore.toFixed(2)}:`, group.map(f => f.name))
      
      // All friends in this group get the same score
      group.forEach(friend => {
        result.push({
          ...friend,
          closeness: groupScore,
          iconKey: generateIconKey(groupScore)
        })
      })
    })
    
    console.log('🔍 DEBUG: Final scores:', result.map(f => ({ name: f.name, closeness: f.closeness })))
    
    return result
  }

  const handleComparison = async (result: -1 | 0 | 1) => {
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
      } else if (result > 0) {
        // candidate is more close, search left half  
        newHi = mid - 1
      } else {
        // candidate is about the same, give them the same score as the pivot
        const pivotScore = currentPivot.closeness
        console.log(`🔍 DEBUG: TIE - ${candidate.name} is about the same as ${currentPivot.name} (score: ${pivotScore})`)
        
        const newFriend = {
          ...candidate,
          closeness: pivotScore,
          iconKey: generateIconKey(pivotScore)
        }
        
        // Insert the new friend at the same position as the pivot
        const newSorted = [...sortedFriends]
        newSorted.splice(mid, 0, newFriend)
        
        console.log('🔍 DEBUG: After inserting tied friend, sorted order:', newSorted.map(f => ({ name: f.name, closeness: f.closeness })))
        
        // Use tie-aware scoring to preserve existing ties
        const friendsWithRelativeScores = applyTieAwareScoring(newSorted)
        
        setFriends(friendsWithRelativeScores)
        endRating()
        return
      }

      // Check if we're done with binary search
      if (newLo > newHi || comparisons + 1 >= maxComparisons) {
        // Insert candidate at the correct position
        const insertAt = newLo
        console.log(`🔍 DEBUG: Binary search complete - inserting ${candidate.name} at position ${insertAt}`)
        
        // Give the candidate a temporary score based on their position
        // If inserting at the last position, make sure it's lower than the current lowest score
        let tempScore
        if (insertAt === sortedFriends.length) {
          // Inserting at the end - make it significantly lower than the current lowest score
          const currentLowest = Math.min(...sortedFriends.map(f => f.closeness))
          tempScore = currentLowest - 0.1 // Use a significant difference to avoid grouping
        } else {
          // Normal position-based scoring
          const totalFriends = sortedFriends.length + 1
          tempScore = totalFriends > 1 
            ? (totalFriends - 1 - insertAt) / (totalFriends - 1) * 10
            : 10
        }
        
        const candidateWithTempScore = {
          ...candidate,
          closeness: tempScore,
          iconKey: generateIconKey(tempScore)
        }
        
        const newSorted = [...sortedFriends]
        newSorted.splice(insertAt, 0, candidateWithTempScore)
        
        console.log('🔍 DEBUG: After insertion with temp score:', newSorted.map(f => ({ name: f.name, closeness: f.closeness })))
        
        // Use tie-aware scoring to preserve existing ties
        const friendsWithRelativeScores = applyTieAwareScoring(newSorted)
        
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
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        handleComparison(0) // Space or Enter = about the same
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isProcessing, currentPivot, handleComparison])

  if (!currentPivot) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>rating complete!</h2>
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
            <CardTitle className={`text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              who are you closer to?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              click on the friend you're closer to, or "about the same" if they're similar
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
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{candidate.name}</h3>
              <p className="text-sm text-muted-foreground">new friend</p>
            </div>
          </motion.div>

          {/* VS divider */}
          <div className={`text-center font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>VS</div>

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
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{currentPivot.name}</h3>
              <p className="text-sm text-muted-foreground">
                closeness: {currentPivot.closeness.toFixed(1)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* About the same button */}
        <div className="text-center my-4">
          <Button
            variant="outline"
            onClick={() => handleComparison(0)}
            disabled={isProcessing}
            className={`px-4 py-2 text-sm font-medium ${theme === 'dark' ? 'text-white border-white hover:bg-white hover:text-black' : 'text-black border-black hover:bg-black hover:text-white'}`}
          >
            about the same
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
            use ← → arrow keys, spacebar for "about the same", or click buttons
          </p>
          <p className="md:hidden">
            swipe left/right or tap buttons
          </p>
        </div>
      </div>
    </div>
  )
}
