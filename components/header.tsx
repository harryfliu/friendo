'use client'

import { useOrbitStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ResetDialog } from '@/components/reset-dialog'
import { Moon, Sun, Plus, Settings, Orbit, Map, Play } from 'lucide-react'

export function Header() {
  const { theme, toggleTheme, friends, resetFriends, showAddFriendForm, currentView, setCurrentView, isDemoMode, toggleDemoMode } = useOrbitStore()

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
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b ${
      theme === 'dark' 
        ? 'bg-gray-900/80 border-gray-700' 
        : 'bg-background/80 border-border'
    }`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <h1 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-foreground'
            }`}>friendo</h1>
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'
            }`}>
              {friends.length} friends
            </span>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1">
            <Button
              variant={currentView === 'orbit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('orbit')}
              className={`spring-transition ${
                theme === 'dark' 
                  ? currentView === 'orbit' 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'text-white hover:bg-gray-800'
                  : ''
              }`}
            >
              <Orbit className="h-4 w-4 mr-2" />
              orbit
            </Button>
            <Button
              variant={currentView === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('map')}
              className={`spring-transition ${
                theme === 'dark' 
                  ? currentView === 'map' 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'text-white hover:bg-gray-800'
                  : ''
              }`}
            >
              <Map className="h-4 w-4 mr-2" />
              map
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddFriend}
            className={`spring-transition ${
              theme === 'dark' 
                ? 'text-white hover:bg-gray-800' 
                : ''
            }`}
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
            onClick={toggleDemoMode}
            className={`spring-transition ${
              theme === 'dark' 
                ? isDemoMode 
                  ? 'text-yellow-400 hover:bg-gray-800' 
                  : 'text-white hover:bg-gray-800'
                : isDemoMode 
                  ? 'text-yellow-600 hover:bg-gray-100'
                  : ''
            }`}
            title={isDemoMode ? 'Demo mode enabled' : 'Demo mode disabled'}
          >
            <Play className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={`spring-transition ${
              theme === 'dark' 
                ? 'text-white hover:bg-gray-800' 
                : ''
            }`}
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
            className={`spring-transition ${
              theme === 'dark' 
                ? 'text-white hover:bg-gray-800' 
                : ''
            }`}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
