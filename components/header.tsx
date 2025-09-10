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
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
        {/* Left side - Title and navigation */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <h1 className={`text-lg sm:text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-foreground'
            }`}>friendo</h1>
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${
              theme === 'dark' 
                ? 'text-gray-300 bg-gray-800/50' 
                : 'text-muted-foreground bg-gray-100'
            }`}>
              {friends.length} friends
            </span>
          </div>
          
          {/* Navigation Tabs - Show on all screens */}
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
              <Orbit className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">orbit</span>
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
              <Map className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">map</span>
            </Button>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Add friend button - Show text on larger screens */}
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
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">add friend</span>
          </Button>

          {/* Reset dialog - Only show if friends exist */}
          {friends.length > 0 && (
            <ResetDialog onReset={handleReset} friendCount={friends.length} />
          )}

          {/* Demo mode toggle - Hide on mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDemoMode}
            className={`spring-transition hidden sm:flex ${
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

          {/* Theme toggle */}
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

          {/* Settings - Hide on mobile to save space */}
          <Button
            variant="ghost"
            size="sm"
            className={`spring-transition hidden sm:flex ${
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
