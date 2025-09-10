'use client'

import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { geoMercator } from 'd3-geo'
import { useOrbitStore } from '@/lib/store'
import { getClosenessBarColor } from '@/lib/utils'
import type { Friend } from '@/lib/types'
import { useState, useRef, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// World map with US states
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
const usStatesUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

// Simple geocoding function - in a real app, you'd use a proper geocoding service
function getCoordinates(friend: Friend): { lat: number; lng: number } | null {
  if (!friend.city || !friend.country) return null
  
  // Simple mapping for demo purposes - in production, use a real geocoding API
  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'sf': { lat: 37.7749, lng: -122.4194 },
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'new york': { lat: 40.7128, lng: -74.0060 },
    'nyc': { lat: 40.7128, lng: -74.0060 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'paris': { lat: 48.8566, lng: 2.3522 },
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'sydney': { lat: -33.8688, lng: 151.2093 },
    'toronto': { lat: 43.6532, lng: -79.3832 },
    'vancouver': { lat: 49.2827, lng: -123.1207 },
    'seattle': { lat: 47.6062, lng: -122.3321 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'la': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'boston': { lat: 42.3601, lng: -71.0589 },
    'miami': { lat: 25.7617, lng: -80.1918 },
    'austin': { lat: 30.2672, lng: -97.7431 },
    'denver': { lat: 39.7392, lng: -104.9903 },
    'portland': { lat: 45.5152, lng: -122.6784 },
    'berlin': { lat: 52.5200, lng: 13.4050 },
    'madrid': { lat: 40.4168, lng: -3.7038 },
    'rome': { lat: 41.9028, lng: 12.4964 },
    'amsterdam': { lat: 52.3676, lng: 4.9041 },
    'dublin': { lat: 53.3498, lng: -6.2603 },
    'singapore': { lat: 1.3521, lng: 103.8198 },
    'hong kong': { lat: 22.3193, lng: 114.1694 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'mexico city': { lat: 19.4326, lng: -99.1332 },
    'sao paulo': { lat: -23.5505, lng: -46.6333 },
    'buenos aires': { lat: -34.6118, lng: -58.3960 },
    'cairo': { lat: 30.0444, lng: 31.2357 },
    'cape town': { lat: -33.9249, lng: 18.4241 },
    'nairobi': { lat: -1.2921, lng: 36.8219 },
    'lagos': { lat: 6.5244, lng: 3.3792 },
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'tel aviv': { lat: 32.0853, lng: 34.7818 },
    'istanbul': { lat: 41.0082, lng: 28.9784 },
    'moscow': { lat: 55.7558, lng: 37.6176 },
    'beijing': { lat: 39.9042, lng: 116.4074 },
    'shanghai': { lat: 31.2304, lng: 121.4737 },
    'seoul': { lat: 37.5665, lng: 126.9780 },
    'bangkok': { lat: 13.7563, lng: 100.5018 },
    'manila': { lat: 14.5995, lng: 120.9842 },
    'jakarta': { lat: -6.2088, lng: 106.8456 },
    'kuala lumpur': { lat: 3.1390, lng: 101.6869 },
    'ho chi minh city': { lat: 10.8231, lng: 106.6297 },
    'melbourne': { lat: -37.8136, lng: 144.9631 },
    'perth': { lat: -31.9505, lng: 115.8605 },
    'brisbane': { lat: -27.4698, lng: 153.0251 },
    'auckland': { lat: -36.8485, lng: 174.7633 },
    'wellington': { lat: -41.2924, lng: 174.7787 },
  }
  
  const cityKey = friend.city.toLowerCase()
  return cityCoordinates[cityKey] || null
}

export function WorldMap() {
  const { friends, selectFriend } = useOrbitStore()
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([-95, 40]) // Centered on USA
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const zoomableGroupRef = useRef<any>(null)
  
  const friendsWithCoordinates = friends
    .map(friend => ({
      ...friend,
      coordinates: getCoordinates(friend)
    }))
    .filter(friend => friend.coordinates !== null)

  // Group friends by city
  const friendsByCity = friendsWithCoordinates.reduce((acc, friend) => {
    const cityKey = `${friend.city}, ${friend.state}, ${friend.country}`.toLowerCase()
    if (!acc[cityKey]) {
      acc[cityKey] = []
    }
    acc[cityKey].push(friend)
    return acc
  }, {} as Record<string, typeof friendsWithCoordinates>)

  // Get cities with multiple friends
  const citiesWithMultipleFriends = Object.entries(friendsByCity)
    .filter(([_, friends]) => friends.length > 1)
    .map(([cityKey, friends]) => ({
      cityKey,
      friends,
      coordinates: friends[0].coordinates!,
      count: friends.length
    }))
  
  if (friendsWithCoordinates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No friends with locations yet</h2>
          <p className="text-muted-foreground mb-4">
            Add friends with city and country information to see them on the map
          </p>
        </div>
      </div>
    )
  }
  
  const handleZoomIn = () => {
    console.log('🔍 Zoom IN - current center:', center)
    setZoom(prev => prev * 1.1)
  }

  const handleZoomOut = () => {
    console.log('🔍 Zoom OUT - current center:', center)
    setZoom(prev => prev / 1.1)
  }

  const handleReset = () => {
    setZoom(1)
    setCenter([-95, 40]) // Reset to USA center
    setSelectedCity(null)
  }

  const handleCityClick = (city: typeof citiesWithMultipleFriends[0]) => {
    if (selectedCity === city.cityKey) {
      // If clicking the same city, collapse it
      setSelectedCity(null)
    } else {
      // Expand to show this city
      setSelectedCity(city.cityKey)
      // Don't change center or zoom - let user control where they're looking
    }
  }

  // Generate distributed positions for friends in the same city with lines
  const getDistributedPosition = (friend: typeof friendsWithCoordinates[0], cityFriends: typeof friendsWithCoordinates) => {
    if (cityFriends.length === 1) return friend.coordinates!
    
    const cityCenter = friend.coordinates!
    const index = cityFriends.findIndex(f => f.id === friend.id)
    const totalFriends = cityFriends.length
    
    // Create lines extending from city center
    const baseRadius = 0.5 // Much larger base radius for visible separation
    const radiusIncrement = 0.2 // Larger increment between each line
    const radius = baseRadius + (index * radiusIncrement)
    
    // Distribute angles evenly around the circle
    const angleStep = (2 * Math.PI) / totalFriends
    const angle = (index * angleStep) + (Math.PI / 4) // Start at 45 degrees
    
    return {
      lat: cityCenter.lat + radius * Math.cos(angle),
      lng: cityCenter.lng + radius * Math.sin(angle)
    }
  }

  const handleMove = ({ zoom, coordinates }: { zoom: number; coordinates: [number, number] | undefined }) => {
    console.log('🗺️ Map move event:', { zoom, coordinates, currentCenter: center })
    setZoom(zoom)
    // Update center to track where user is looking
    if (coordinates) {
      console.log('📍 Updating center to:', coordinates)
      setCenter(coordinates)
    }
  }

  // Handle map click to set new center
  const handleMapClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Create the same projection as the map
    const projection = geoMercator()
      .scale(140 * zoom)
      .center(center)
      .translate([rect.width / 2, rect.height / 2])
    
    // Convert screen coordinates to lat/lng using the projection
    const [lng, lat] = projection.invert([x, y]) || [0, 0]
    
    console.log('🖱️ Map clicked at:', { x, y, lng, lat, center })
    setCenter([lng, lat])
  }
  
  console.log('🗺️ WorldMap render - current state:', { zoom, center, selectedCity })
  
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700">
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140 * zoom,
          center: center
        }}
        className="w-full h-full cursor-crosshair"
        onClick={handleMapClick}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMove={handleMove}
        >
          {/* World countries */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255,255,255,0.8)"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1"
                  style={{
                    default: { 
                      outline: 'none',
                      fill: 'rgba(255,255,255,0.8)',
                      stroke: 'rgba(0,0,0,0.3)',
                      strokeWidth: '1'
                    },
                    hover: { 
                      outline: 'none',
                      fill: 'rgba(255,255,255,0.9)',
                      stroke: 'rgba(0,0,0,0.5)',
                      strokeWidth: '1.5'
                    },
                    pressed: { 
                      outline: 'none',
                      fill: 'rgba(255,255,255,0.9)',
                      stroke: 'rgba(0,0,0,0.5)',
                      strokeWidth: '1.5'
                    },
                  }}
                />
              ))
            }
          </Geographies>
          
          {/* US States - only show when zoomed in on US */}
          {zoom > 1.5 && (
            <Geographies geography={usStatesUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="rgba(255,255,255,0.1)"
                    stroke="rgba(0,0,0,0.6)"
                    strokeWidth="0.8"
                    style={{
                      default: { 
                        outline: 'none',
                        fill: 'rgba(255,255,255,0.1)',
                        stroke: 'rgba(0,0,0,0.6)',
                        strokeWidth: '0.8'
                      },
                      hover: { 
                        outline: 'none',
                        fill: 'rgba(255,255,255,0.2)',
                        stroke: 'rgba(0,0,0,0.8)',
                        strokeWidth: '1'
                      },
                      pressed: { 
                        outline: 'none',
                        fill: 'rgba(255,255,255,0.2)',
                        stroke: 'rgba(0,0,0,0.8)',
                        strokeWidth: '1'
                      },
                    }}
                  />
                ))
              }
            </Geographies>
          )}
          
          {/* City cluster markers - only show when not zoomed into a specific city */}
          {!selectedCity && citiesWithMultipleFriends.map((city) => {
            const { lat, lng } = city.coordinates
            const baseSize = Math.max(4, Math.min(12, city.count * 2))
            const zoomScale = Math.pow(1 / zoom, 1.2)
            const size = Math.max(2, baseSize * zoomScale)
            
            return (
              <Marker key={city.cityKey} coordinates={[lng, lat]}>
                <g>
                  {/* City cluster background */}
                  <circle
                    r={size + 4}
                    fill="rgba(59, 130, 246, 0.3)"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                    className="cursor-pointer hover:scale-110 transition-transform duration-200"
                    onClick={() => handleCityClick(city)}
                  />
                  {/* City name */}
                  {zoom > 1.5 && (
                    <text
                      y={size + 8}
                      textAnchor="middle"
                      className="text-xs font-medium fill-white drop-shadow-lg pointer-events-none"
                      style={{ fontSize: Math.max(6, 7 / Math.pow(zoom, 1.1)) + 'px' }}
                    >
                      {city.cityKey.split(',')[0].toUpperCase()}
                    </text>
                  )}
                </g>
              </Marker>
            )
          })}


          {/* Connecting lines for selected city */}
          {selectedCity && citiesWithMultipleFriends
            .filter(city => city.cityKey === selectedCity)
            .map((city) => {
              const cityPosition = city.coordinates
              return city.friends.map((friend) => {
                const friendPosition = getDistributedPosition(friend, city.friends)
                return (
                  <Marker key={`line-${friend.id}`} coordinates={[cityPosition.lng, cityPosition.lat]}>
                    <g>
                      <line
                        x1={0}
                        y1={0}
                        x2={(friendPosition.lng - cityPosition.lng) * 1000}
                        y2={(friendPosition.lat - cityPosition.lat) * 1000}
                        stroke="rgba(0,0,0,0.6)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                    </g>
                  </Marker>
                )
              })
            })
          }

          {/* Center indicator */}
          <Marker coordinates={center}>
            <g>
              <circle
                r="8"
                fill="rgba(255,0,0,0.3)"
                stroke="red"
                strokeWidth="2"
                className="animate-pulse"
              />
              <circle
                r="3"
                fill="red"
              />
            </g>
          </Marker>

          {/* Individual friend markers - only show if not in a city with multiple friends */}
          {friendsWithCoordinates.map((friend) => {
            // Check if this friend is in a city with multiple friends
            const cityKey = `${friend.city}, ${friend.state}, ${friend.country}`.toLowerCase()
            const isInCityCluster = citiesWithMultipleFriends.some(city => city.cityKey === cityKey)
            
            // Don't render individual markers for friends in city clusters (unless city is selected)
            if (isInCityCluster && !selectedCity) {
              return null
            }
            
            // If a city is selected, only show friends from that specific city
            if (selectedCity && cityKey !== selectedCity) {
              return null
            }
            
            // Get distributed position if in a selected city
            const cityFriends = friendsByCity[cityKey]
            let position
            if (selectedCity && cityFriends?.length > 1) {
              // When a city is selected, position friends at the end of the lines
              const cityPosition = citiesWithMultipleFriends.find(city => city.cityKey === selectedCity)?.coordinates
              if (cityPosition) {
                const distributedPos = getDistributedPosition(friend, cityFriends)
                // Position friend at the exact end of the line
                position = {
                  lat: cityPosition.lat + (distributedPos.lat - cityPosition.lat),
                  lng: cityPosition.lng + (distributedPos.lng - cityPosition.lng)
                }
              } else {
                position = friend.coordinates!
              }
            } else {
              position = friend.coordinates!
            }
            
            const { lat, lng } = position
            const color = getClosenessBarColor(friend.closeness)
            // Scale size based on zoom level - much smaller when zoomed in
            const baseSize = Math.max(1, Math.min(6, friend.closeness * 0.5)) // Smaller base size
            const zoomScale = Math.pow(1 / zoom, 1.5) // More aggressive scaling at high zoom
            const size = Math.max(0.5, baseSize * zoomScale) // Even smaller minimum
            
            return (
              <Marker key={friend.id} coordinates={[lng, lat]}>
                <g>
                  {/* Glow effect */}
                  <circle
                    r={size + 2}
                    fill={color}
                    opacity="0.4"
                    className="animate-pulse"
                  />
                  {/* Main dot */}
                  <circle
                    r={size}
                    fill={color}
                    stroke="white"
                    strokeWidth="1"
                    className="cursor-pointer hover:scale-110 transition-transform duration-200"
                    onClick={() => selectFriend(friend)}
                  />
                  {/* Friend name - only show when zoomed in enough AND not in a city with multiple friends */}
                  {zoom > 1.2 && !isInCityCluster && (
                    <text
                      y={-size - 2}
                      textAnchor="middle"
                      className="text-xs font-medium fill-white drop-shadow-lg pointer-events-none"
                      style={{ fontSize: Math.max(6, 8 / Math.pow(zoom, 1.2)) + 'px' }}
                    >
                      {friend.name}
                    </text>
                  )}
                </g>
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-semibold mb-2">Closeness Levels</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Closest (9-10)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Very Close (7.5-9)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Close (6-7.5)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Moderate (4-6)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-teal-500"></div>
            <span>Distant (2-4)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Very Distant (0-2)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
