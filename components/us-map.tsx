'use client'

import React, { useState, useEffect } from 'react'
import { useOrbitStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { getIconConfig } from '@/lib/rating/insert'

// Extend Window interface for Leaflet map
declare global {
  interface Window {
    leafletMap: any
  }
}

// Function to generate friends in a circular pattern around a city center
const generateCityFriends = (cityCenter: { lat: number, lng: number }, cityName: string, state: string, count: number) => {
  const friends = []
  const radius = 0.02 // ~1.5km radius for SF
  
  for (let i = 0; i < count; i++) {
    // Generate different closeness scores
    const closeness = Math.random() * 10 // 0-10 range
    const iconKey = closeness >= 8 ? 'star12-red' : 
                   closeness >= 6 ? 'star8-orange' : 
                   closeness >= 4 ? 'hexagon-green' : 
                   closeness >= 2 ? 'square-teal' : 'dot-blue'
    
    // Generate positions in a circle around the city center
    const angle = (i / count) * 2 * Math.PI // Distribute evenly around circle
    const distance = radius * (0.3 + Math.random() * 0.7) // Random distance within radius
    
    const lat = cityCenter.lat + (distance * Math.cos(angle))
    const lng = cityCenter.lng + (distance * Math.sin(angle))
    
    friends.push({
      id: `sf-${i + 1}`,
      name: `SF Friend ${i + 1}`,
      iconKey,
      userId: `user-sf-${i + 1}`,
      createdAt: new Date(),
      closeness: Math.round(closeness * 10) / 10, // Round to 1 decimal
      city: cityName,
      state,
      country: 'USA',
      coordinates: { lat, lng },
    })
  }
  
  return friends
}

// Demo friends data for demo mode
const DEMO_FRIENDS = [
  // 10 friends in San Francisco
  ...generateCityFriends({ lat: 37.7749, lng: -122.4194 }, 'San Francisco', 'CA', 10),
  
  // 3 friends in New York
  {
    id: 'ny-1', 
    name: 'Bob Smith',
    iconKey: 'star8-orange',
    userId: 'user-ny-1',
    createdAt: new Date(),
    closeness: 6.8,
    city: 'New York',
    state: 'NY',
    country: 'USA',
    coordinates: { lat: 40.7128, lng: -74.0060 },
  },
  {
    id: 'ny-2', 
    name: 'Sarah Johnson',
    iconKey: 'hexagon-green',
    userId: 'user-ny-2',
    createdAt: new Date(),
    closeness: 4.2,
    city: 'New York',
    state: 'NY',
    country: 'USA',
    coordinates: { lat: 40.7589, lng: -73.9851 },
  },
  {
    id: 'ny-3', 
    name: 'Mike Chen',
    iconKey: 'square-teal',
    userId: 'user-ny-3',
    createdAt: new Date(),
    closeness: 2.1,
    city: 'New York',
    state: 'NY',
    country: 'USA',
    coordinates: { lat: 40.6892, lng: -74.0445 },
  },
  
  // 2 friends in Los Angeles
  {
    id: 'la-1',
    name: 'Carol Davis',
    iconKey: 'hexagon-green',
    userId: 'user-la-1',
    createdAt: new Date(),
    closeness: 3.1,
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    coordinates: { lat: 34.0522, lng: -118.2437 },
  },
  {
    id: 'la-2',
    name: 'David Wilson',
    iconKey: 'dot-blue',
    userId: 'user-la-2',
    createdAt: new Date(),
    closeness: 1.5,
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    coordinates: { lat: 34.0736, lng: -118.4004 },
  }
]

// Function to create simple brightness-based markers with legend colors
const createSimpleIcon = (friend: any, L: any) => {
  const closeness = friend.closeness || 5
  const size = 16 // Fixed size for simplicity
  
  // Calculate brightness based on closeness (0-10 scale)
  // Closer friends = brighter (higher opacity)
  const brightness = Math.max(0.3, Math.min(1.0, closeness / 10))
  
  // Get color based on closeness to match legend
  const getColor = (closeness: number) => {
    if (closeness >= 8) return '#ef4444'      // Red - Very Close
    if (closeness >= 6) return '#f97316'      // Orange - Close
    if (closeness >= 4) return '#eab308'      // Yellow - Moderate
    if (closeness >= 2) return '#22c55e'      // Green - Distant
    return '#3b82f6'                          // Blue - Very Distant
  }
  
  const baseColor = getColor(closeness)
  
  // Create simple circle with brightness and subtle glow
  const createSimpleCircle = (size: number, color: string, brightness: number) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', (size * 2).toString())
    svg.setAttribute('height', (size * 2).toString())
    svg.setAttribute('viewBox', `0 0 ${size * 2} ${size * 2}`)
    
    // Define glow filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', `glow-${friend.id}`)
    filter.setAttribute('x', '-50%')
    filter.setAttribute('y', '-50%')
    filter.setAttribute('width', '200%')
    filter.setAttribute('height', '200%')
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
    feGaussianBlur.setAttribute('stdDeviation', '1.5')
    feGaussianBlur.setAttribute('result', 'coloredBlur')
    
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge')
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode')
    feMergeNode1.setAttribute('in', 'coloredBlur')
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode')
    feMergeNode2.setAttribute('in', 'SourceGraphic')
    
    feMerge.appendChild(feMergeNode1)
    feMerge.appendChild(feMergeNode2)
    filter.appendChild(feGaussianBlur)
    filter.appendChild(feMerge)
    defs.appendChild(filter)
    svg.appendChild(defs)
    
    // Glow circle (slightly larger, more transparent)
    const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    glowCircle.setAttribute('cx', size.toString())
    glowCircle.setAttribute('cy', size.toString())
    glowCircle.setAttribute('r', (size * 0.8).toString())
    glowCircle.setAttribute('fill', color)
    glowCircle.setAttribute('opacity', (brightness * 0.3).toString())
    svg.appendChild(glowCircle)
    
    // Main circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', size.toString())
    circle.setAttribute('cy', size.toString())
    circle.setAttribute('r', (size * 0.7).toString())
    circle.setAttribute('fill', color)
    circle.setAttribute('opacity', brightness.toString())
    circle.setAttribute('filter', `url(#glow-${friend.id})`)
    svg.appendChild(circle)
    
    return svg
  }
  
  const svg = createSimpleCircle(size, baseColor, brightness)
  const svgString = new XMLSerializer().serializeToString(svg)
  
  return L.divIcon({
    html: svgString,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size],
    className: 'simple-icon'
  })
}

export default function USMap() {
  const [isClient, setIsClient] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [mapMarkers, setMapMarkers] = useState<any[]>([])
  const { friends, theme, isDemoMode } = useOrbitStore()

  useEffect(() => {
    setIsClient(true)

    let timer: NodeJS.Timeout | null = null

    if (typeof window !== 'undefined') {
      // Add a small delay to ensure the DOM element is ready
      timer = setTimeout(() => {
        import('leaflet').then((L) => {
          console.log('🌍 Creating US Leaflet map...')
          
          // Check if the map container exists
          const mapContainer = document.getElementById('map')
          if (!mapContainer) {
            console.error('❌ Map container not found!')
            return
          }
          
          // Fix for default markers in Leaflet
          delete (L.Icon.Default.prototype as any)._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          })
          
          // Create map centered on US
          const map = L.map('map', {
            center: [39.8283, -98.5795], // Center of US
            zoom: 4,
            zoomControl: false // Disable default zoom controls
          })
        
        // Add tile layer based on current theme
        const tileUrl = theme === 'dark' 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
        
        console.log(`🎨 Current theme: ${theme}`)
        console.log(`🎨 Using tile URL: ${tileUrl}`)
        
        L.tileLayer(tileUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
          className: theme === 'dark' ? 'map-tiles-dark' : 'map-tiles-light'
        }).addTo(map)
        
        console.log('🌍 US map created!')
        console.log('🌍 Dragging enabled:', map.dragging.enabled())
        
        // Wait for map to be ready, then add friend markers
        setTimeout(() => {
          console.log('🔍 Starting to add friend markers...')
          // Use demo data if in demo mode, otherwise use real friends with coordinates
          const friendsToShow = isDemoMode 
            ? DEMO_FRIENDS 
            : friends.filter(friend => friend.coordinates)
          console.log(`🔍 Using ${isDemoMode ? 'demo' : 'real'} friends:`, friendsToShow)
          
          // Store markers for filtering
          const markers: any[] = []
          
          // Add markers for each friend
          friendsToShow.forEach((friend, index) => {
            console.log(`🔍 Processing friend ${index + 1}:`, friend)
            console.log(`🔍 Friend ${friend.name} has coordinates:`, friend.coordinates)
            
            // Create simple brightness-based marker
            const simpleIcon = createSimpleIcon(friend, L)
            const marker = L.marker([friend.coordinates!.lat, friend.coordinates!.lng], {
              icon: simpleIcon
            })
              .addTo(map)
              .bindPopup(`
                <div style="text-align: center; min-width: 120px;">
                  <b>${friend.name}</b><br/>
                  <span style="color: #666; font-size: 12px;">
                    ${friend.city || 'Unknown'}, ${friend.state || 'Unknown'}<br/>
                    Closeness: ${friend.closeness.toFixed(1)}/10
                  </span>
                </div>
              `)
            
            // Store marker with friend data for filtering
            markers.push({ marker, friend })
            
            console.log(`📍 Added custom icon marker for ${friend.name} at [${friend.coordinates!.lat}, ${friend.coordinates!.lng}]`)
          })
          
          // Store markers in state for filtering
          setMapMarkers(markers)
          
          console.log(`📍 Added ${friendsToShow.length} friend markers`)
        }, 500)
        
        // Store map reference for controls
        window.leafletMap = map
        })
      }, 100) // Small delay to ensure DOM is ready
    }
    
    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
      if (window.leafletMap) {
        try {
          window.leafletMap.remove()
          console.log('🗑️ Cleaned up map on unmount')
        } catch (error) {
          console.log('⚠️ Error cleaning up map:', error)
        }
      }
    }
  }, [friends, theme, isDemoMode]) // Recreate map when theme or demo mode changes

  const handleZoomIn = () => {
    if (window.leafletMap) window.leafletMap.zoomIn()
  }
  
  const handleZoomOut = () => {
    if (window.leafletMap) window.leafletMap.zoomOut()
  }
  
  const handleReset = () => {
    if (window.leafletMap) window.leafletMap.setView([39.8283, -98.5795], 4)
  }

  // Filter markers based on closeness category
  const handleFilterChange = (category: string | null) => {
    setSelectedFilter(category)
    
    mapMarkers.forEach(({ marker, friend }) => {
      const shouldShow = !category || getClosenessCategory(friend.closeness) === category
      
      if (shouldShow) {
        marker.addTo(window.leafletMap)
      } else {
        marker.remove()
      }
    })
  }

  // Get closeness category from score
  const getClosenessCategory = (closeness: number) => {
    if (closeness >= 8) return 'very-close'
    if (closeness >= 6) return 'close'
    if (closeness >= 4) return 'moderate'
    if (closeness >= 2) return 'distant'
    return 'very-distant'
  }

  // Get count for each category
  const getCategoryCount = (category: string) => {
    const dataSource = isDemoMode ? DEMO_FRIENDS : friends
    return dataSource.filter(friend => getClosenessCategory(friend.closeness) === category).length
  }

  // Get cities for filtered friends
  const getFilteredCities = (category: string | null) => {
    if (!category) return []
    
    const dataSource = isDemoMode ? DEMO_FRIENDS : friends
    const filteredFriends = dataSource.filter(friend => getClosenessCategory(friend.closeness) === category)
    const cities = Array.from(new Set(filteredFriends.map(friend => `${friend.city || 'Unknown'}, ${friend.state || 'Unknown'}`)))
    return cities
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        key={`map-${theme}`}
        id="map" 
        className="w-full h-full"
        style={{ 
          height: 'calc(100vh - 4rem)',
          width: '100%'
        }}
      ></div>
      
      {/* CSS for map themes and dot glow */}
      <style jsx>{`
        .map-tiles-dark {
          /* Dark theme - no filters needed */
        }
        
        .map-tiles-light {
          /* Light theme - no filters needed */
        }
        
        .simple-icon {
          filter: drop-shadow(0 0 4px rgba(0,0,0,0.3));
        }
        
        .dark .simple-icon {
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.3));
        }
      `}</style>
      
      {/* Interactive Closeness Legend */}
      <div className={`absolute top-4 right-4 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10 ${
        theme === 'dark' ? 'bg-gray-900/90 text-white' : 'bg-white/90 text-gray-900'
      }`} style={{ zIndex: 1000 }}>
        <h3 className="font-semibold text-sm mb-3">Filter by Closeness</h3>
        
        {/* All Friends Button */}
        <button
          onClick={() => handleFilterChange(null)}
          className={`w-full flex items-center justify-between p-2 rounded-lg mb-2 transition-all ${
            selectedFilter === null 
              ? theme === 'dark' 
                ? 'bg-blue-900/50 border-2 border-blue-400' 
                : 'bg-blue-100 border-2 border-blue-500'
              : theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 to-blue-500 rounded-full"></div>
            <span className="text-xs font-medium">All Friends</span>
          </div>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {isDemoMode ? DEMO_FRIENDS.length : friends.length}
          </span>
        </button>
        
        {/* Individual Category Buttons */}
        <div className="space-y-1">
          <button
            onClick={() => handleFilterChange(selectedFilter === 'very-close' ? null : 'very-close')}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
              selectedFilter === 'very-close' 
                ? theme === 'dark'
                  ? 'bg-red-900/50 border-2 border-red-400'
                  : 'bg-red-100 border-2 border-red-500'
                : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-xs font-medium">Very Close</span>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{getCategoryCount('very-close')}</span>
          </button>
          
          <button
            onClick={() => handleFilterChange(selectedFilter === 'close' ? null : 'close')}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
              selectedFilter === 'close' 
                ? theme === 'dark'
                  ? 'bg-orange-900/50 border-2 border-orange-400'
                  : 'bg-orange-100 border-2 border-orange-500'
                : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-xs font-medium">Close</span>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{getCategoryCount('close')}</span>
          </button>
          
          <button
            onClick={() => handleFilterChange(selectedFilter === 'moderate' ? null : 'moderate')}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
              selectedFilter === 'moderate' 
                ? theme === 'dark'
                  ? 'bg-yellow-900/50 border-2 border-yellow-400'
                  : 'bg-yellow-100 border-2 border-yellow-500'
                : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-xs font-medium">Moderate</span>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{getCategoryCount('moderate')}</span>
          </button>
          
          <button
            onClick={() => handleFilterChange(selectedFilter === 'distant' ? null : 'distant')}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
              selectedFilter === 'distant' 
                ? theme === 'dark'
                  ? 'bg-green-900/50 border-2 border-green-400'
                  : 'bg-green-100 border-2 border-green-500'
                : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium">Distant</span>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{getCategoryCount('distant')}</span>
          </button>
          
          <button
            onClick={() => handleFilterChange(selectedFilter === 'very-distant' ? null : 'very-distant')}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
              selectedFilter === 'very-distant' 
                ? theme === 'dark'
                  ? 'bg-blue-900/50 border-2 border-blue-400'
                  : 'bg-blue-100 border-2 border-blue-500'
                : theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium">Very Distant</span>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{getCategoryCount('very-distant')}</span>
          </button>
        </div>
        
        <div className={`mt-3 pt-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          {selectedFilter ? (
            <div>
              <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                Showing {getCategoryCount(selectedFilter)} friends
              </p>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                {getFilteredCities(selectedFilter).length > 0 ? (
                  <>
                    <div className="mb-1">in:</div>
                    {getFilteredCities(selectedFilter).map((city, index) => (
                      <div key={index} className="ml-2">• {city}</div>
                    ))}
                  </>
                ) : (
                  <div>No friends in this category</div>
                )}
              </div>
            </div>
          ) : (
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Showing all friends</p>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col space-y-2">
        <Button size="sm" variant="outline" onClick={handleZoomIn} className={`backdrop-blur-sm ${
          theme === 'dark' ? 'bg-gray-900/90 text-white border-gray-700' : 'bg-white/90 text-gray-900'
        }`}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleZoomOut} className={`backdrop-blur-sm ${
          theme === 'dark' ? 'bg-gray-900/90 text-white border-gray-700' : 'bg-white/90 text-gray-900'
        }`}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} className={`backdrop-blur-sm ${
          theme === 'dark' ? 'bg-gray-900/90 text-white border-gray-700' : 'bg-white/90 text-gray-900'
        }`}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}