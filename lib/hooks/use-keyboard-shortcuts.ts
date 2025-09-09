'use client'

import { useEffect } from 'react'
import { useOrbitStore } from '@/lib/store'
import { KEYBOARD_SHORTCUTS } from '@/lib/constants'

export function useKeyboardShortcuts() {
  const { isRating, currentCandidate, endRating } = useOrbitStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isRating) return

      switch (event.key) {
        case KEYBOARD_SHORTCUTS.LESS:
          event.preventDefault()
          // Trigger less close comparison
          console.log('Less close comparison')
          break
          
        case KEYBOARD_SHORTCUTS.MORE:
          event.preventDefault()
          // Trigger more close comparison
          console.log('More close comparison')
          break
          
        case KEYBOARD_SHORTCUTS.CANCEL:
          event.preventDefault()
          endRating()
          break
          
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isRating, endRating])
}
