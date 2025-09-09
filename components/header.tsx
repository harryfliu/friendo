'use client'

import { useOrbitStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ResetDialog } from '@/components/reset-dialog'
import { Moon, Sun, Plus, Settings } from 'lucide-react'

export function Header() {
  const { theme, toggleTheme, friends, resetFriends, showAddFriendForm } = useOrbitStore()

  const handleAddFriend = () => {
    showAddFriendForm()
  }

  const handleReset = () => {
    console.log('🎯 Header reset handler called')
    resetFriends()
    // Set a flag that the user has manually reset, so demo data won't reload
    if (typeof window !== 'undefined') {
      localStorage.setItem('friendo-has-been-reset', 'true')
      console.log('🏷️ Set has-been-reset flag')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-foreground">friendo</h1>
          <span className="text-sm text-muted-foreground">
            {friends.length} friends
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddFriend}
            className="spring-transition"
          >
            <Plus className="h-4 w-4 mr-2" />
            add friend
          </Button>

          {friends.length > 0 && (
            <ResetDialog onReset={handleReset} friendCount={friends.length} />
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="spring-transition"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="spring-transition"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
