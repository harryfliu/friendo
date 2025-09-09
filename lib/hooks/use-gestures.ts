'use client'

import { useRef, useCallback } from 'react'
import { GESTURE_CONFIG } from '@/lib/constants'

interface GestureState {
  startX: number
  startY: number
  startTime: number
  isDragging: boolean
}

export function useGestures() {
  const gestureState = useRef<GestureState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isDragging: false,
  })

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    gestureState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isDragging: false,
    }
  }, [])

  const onTouchMove = useCallback((event: React.TouchEvent) => {
    if (!gestureState.current.isDragging) {
      const touch = event.touches[0]
      const deltaX = Math.abs(touch.clientX - gestureState.current.startX)
      const deltaY = Math.abs(touch.clientY - gestureState.current.startY)
      
      if (deltaX > 10 || deltaY > 10) {
        gestureState.current.isDragging = true
      }
    }
  }, [])

  const onTouchEnd = useCallback((
    event: React.TouchEvent,
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    onSwipeUp?: () => void,
    onSwipeDown?: () => void
  ) => {
    if (!gestureState.current.isDragging) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - gestureState.current.startX
    const deltaY = touch.clientY - gestureState.current.startY
    const deltaTime = Date.now() - gestureState.current.startTime

    const isSwipe = Math.abs(deltaX) > GESTURE_CONFIG.swipeThreshold || 
                   Math.abs(deltaY) > GESTURE_CONFIG.swipeThreshold
    const isQuickSwipe = deltaTime < 300

    if (isSwipe && isQuickSwipe) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }
    }

    gestureState.current.isDragging = false
  }, [])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
