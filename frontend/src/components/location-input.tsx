'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Search } from 'lucide-react'

interface LocationInputProps {
  onLocationChange: (lat: number, lon: number) => void
  currentLat?: number
  currentLon?: number
}

export function LocationInput({ onLocationChange, currentLat, currentLon }: LocationInputProps) {
  const [lat, setLat] = useState(currentLat?.toString() || '')
  const [lon, setLon] = useState(currentLon?.toString() || '')
  const [loading, setLoading] = useState(false)

  const handleGetCurrentLocation = () => {
    setLoading(true)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLat(latitude.toFixed(6))
          setLon(longitude.toFixed(6))
          onLocationChange(latitude, longitude)
          setLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLoading(false)
          alert('Unable to get your location. Please enter coordinates manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      alert('Please enter valid latitude and longitude')
      return
    }
    
    if (latNum < -90 || latNum > 90) {
      alert('Latitude must be between -90 and 90')
      return
    }
    
    if (lonNum < -180 || lonNum > 180) {
      alert('Longitude must be between -180 and 180')
      return
    }
    
    onLocationChange(latNum, lonNum)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Weather Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g., 6.5244"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
              />
              <p className="text-xs text-gray-600 mt-1">Range: -90 to 90</p>
            </div>
            
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g., 3.3792"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                required
              />
              <p className="text-xs text-gray-600 mt-1">Range: -180 to 180</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Update Weather
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={handleGetCurrentLocation}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Getting Location...' : 'Use My Location'}
            </Button>
          </div>
          
          {currentLat && currentLon && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              Current location: {currentLat.toFixed(4)}, {currentLon.toFixed(4)}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
