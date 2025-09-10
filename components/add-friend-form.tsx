'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useOrbitStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, User, MapPin, Loader2 } from 'lucide-react'
import type { Friend } from '@/lib/types'
import { geocodeAddress } from '@/lib/geocoding'

interface AddFriendFormProps {
  onCancel: () => void
}

export function AddFriendForm({ onCancel }: AddFriendFormProps) {
  const { addFriend, startRating, hideAddFriendForm, friends } = useOrbitStore()
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    country: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodingError, setGeocodingError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    setIsGeocoding(false)
    setGeocodingError(null)
    
    try {
      // Geocode address if location data is provided
      let coordinates: { lat: number; lng: number } | undefined = undefined
      
      if (formData.city.trim() || formData.state.trim() || formData.country.trim()) {
        setIsGeocoding(true)
        console.log('🌍 Geocoding address for friend:', formData.name)
        
        const geocodingResult = await geocodeAddress(
          formData.city.trim() || undefined,
          formData.state.trim() || undefined,
          formData.country.trim() || undefined
        )
        
        if ('error' in geocodingResult) {
          console.warn('⚠️ Geocoding failed:', geocodingResult.message)
          setGeocodingError(`Location not found: ${geocodingResult.message}`)
          // Continue without coordinates
        } else {
          coordinates = {
            lat: geocodingResult.lat,
            lng: geocodingResult.lng
          }
          console.log('✅ Geocoding successful:', geocodingResult.display_name)
        }
        
        setIsGeocoding(false)
      }

      // Create the new friend
      const isFirstFriend = friends.length === 0
      const newFriend: Friend = {
        id: Math.random().toString(36).substr(2, 9),
        userId: 'user1',
        name: formData.name.trim(),
        closeness: isFirstFriend ? 5.0 : 5.0, // All friends start with baseline score
        iconKey: isFirstFriend ? 'hexagon-green' : 'hexagon-green',
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || undefined,
        coordinates,
        createdAt: new Date(),
      }

      // Add friend
      addFriend(newFriend)
      
      // Only start rating if there are existing friends to compare against
      if (friends.length > 0) {
        startRating(newFriend)
      }
      
      // Close the form
      hideAddFriendForm()
      
      // Reset form data
      setFormData({
        name: '',
        city: '',
        state: '',
        country: '',
      })
    } catch (error) {
      console.error('Error adding friend:', error)
    } finally {
      // Reset submitting state
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    hideAddFriendForm()
    onCancel()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl">add a friend</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>name *</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="enter friend's name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                  required
                  autoFocus
                  className="w-full"
                />
              </div>

              {/* Location fields */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>location (optional)</span>
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  <Input
                    type="text"
                    placeholder="city"
                    value={formData.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('city', e.target.value)}
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="text"
                      placeholder="state"
                      value={formData.state}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('state', e.target.value)}
                      className="w-full"
                    />
                    <Input
                      type="text"
                      placeholder="country"
                      value={formData.country}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('country', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Geocoding status */}
              {isGeocoding && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Finding location...</span>
                </div>
              )}

              {/* Geocoding error */}
              {geocodingError && (
                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                  <span>⚠️ {geocodingError}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!formData.name.trim() || isSubmitting || isGeocoding}
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      finding location...
                    </>
                  ) : isSubmitting ? (
                    'adding...'
                  ) : (
                    'add friend'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>after adding, you'll rate how close you feel to this friend compared to your other friends.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
