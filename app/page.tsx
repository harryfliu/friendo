'use client'

import { useEffect, useState } from 'react'
import { useOrbitStore } from '@/lib/store'
import { OrbitVisualization } from '@/components/orbit-visualization'
import { RatingInterface } from '@/components/rating-interface'
import { FriendCard } from '@/components/friend-card'
import { AddFriendForm } from '@/components/add-friend-form'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts'
import { computeRings, computeFriendPositions } from '@/lib/orbit/layout'
import { getIconConfig } from '@/lib/rating/insert'
import type { Friend, FriendWithPosition } from '@/lib/types'

export default function HomePage() {
  const {
    friends,
    ringLayout,
    friendPositions,
    selectedFriend,
    isRating,
    currentCandidate,
    isResetting,
    isAddFriendFormOpen,
    theme,
    setRingLayout,
    setFriendPositions,
    selectFriend,
    hideAddFriendForm,
    showAddFriendForm,
  } = useOrbitStore()


  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial dimensions immediately
    if (typeof window !== 'undefined') {
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Compute ring layout when friends change
  useEffect(() => {
    if (friends.length === 0 || dimensions.width === 0) return

    const scores = friends.map(f => f.closeness)
    const layout = computeRings(scores, dimensions.width, dimensions.height)
    setRingLayout(layout)

    // Compute friend positions
    const positions = computeFriendPositions(friends, layout, dimensions.width, dimensions.height)
    const friendsWithPositions: FriendWithPosition[] = friends.map(friend => {
      const position = positions.find(p => p.id === friend.id)
      const icon = getIconConfig(friend.closeness)
      
      return {
        ...friend,
        position: position || { x: 0, y: 0, ring: 0, angle: 0 },
        icon,
      }
    })

    setFriendPositions(friendsWithPositions)
  }, [friends, dimensions, setRingLayout, setFriendPositions])

  // Demo data for testing - only load once on initial mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const hasLoadedDemo = localStorage.getItem('friendo-demo-loaded')
    if (friends.length === 0 && !hasLoadedDemo) {
      const demoFriends: Friend[] = [
        { id: '1', userId: 'user1', name: 'Alice', closeness: 9.5, iconKey: 'star12-red', createdAt: new Date() },
        { id: '2', userId: 'user1', name: 'Bob', closeness: 7.2, iconKey: 'star8-orange', createdAt: new Date() },
        { id: '3', userId: 'user1', name: 'Charlie', closeness: 5.8, iconKey: 'hexagon-green', createdAt: new Date() },
        { id: '4', userId: 'user1', name: 'Diana', closeness: 3.1, iconKey: 'square-teal', createdAt: new Date() },
        { id: '5', userId: 'user1', name: 'Eve', closeness: 1.2, iconKey: 'dot-blue', createdAt: new Date() },
      ]
      useOrbitStore.getState().setFriends(demoFriends)
      localStorage.setItem('friendo-demo-loaded', 'true')
    }
  }, [friends.length])

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="relative h-screen overflow-hidden bg-background">
        <Header />
        
        <main className="h-full pt-16">
          {isResetting ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">resetting...</p>
              </div>
            </div>
          ) : isRating && currentCandidate ? (
            <RatingInterface candidate={currentCandidate} />
          ) : friends.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <span className="text-4xl">👥</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">no friends yet</h2>
                  <p className="text-muted-foreground mb-4">
                    start building your social orbit by adding your first friend
                  </p>
                  <div className="space-y-2">
                    <Button onClick={showAddFriendForm}>
                      add your first friend
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const demoFriends: Friend[] = [
                          { id: '1', userId: 'user1', name: 'Alice', closeness: 9.5, iconKey: 'star12-red', createdAt: new Date() },
                          { id: '2', userId: 'user1', name: 'Bob', closeness: 7.2, iconKey: 'star8-orange', createdAt: new Date() },
                          { id: '3', userId: 'user1', name: 'Charlie', closeness: 5.8, iconKey: 'hexagon-green', createdAt: new Date() },
                          { id: '4', userId: 'user1', name: 'Diana', closeness: 3.1, iconKey: 'square-teal', createdAt: new Date() },
                          { id: '5', userId: 'user1', name: 'Eve', closeness: 1.2, iconKey: 'dot-blue', createdAt: new Date() },
                        ]
                        useOrbitStore.getState().setFriends(demoFriends)
                      }}
                    >
                      load demo data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <OrbitVisualization 
              friends={friendPositions}
              ringLayout={ringLayout}
              onFriendSelect={selectFriend}
              dimensions={dimensions}
            />
          )}
        </main>

        {selectedFriend && (
          <FriendCard 
            friend={selectedFriend}
            onClose={() => selectFriend(null)}
          />
        )}

        {isAddFriendFormOpen && (
          <AddFriendForm onCancel={hideAddFriendForm} />
        )}
      </div>
    </div>
  )
}
