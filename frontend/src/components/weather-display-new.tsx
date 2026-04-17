'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWeatherData, useWeatherOracle } from '@/hooks'
import { Cloud, CloudRain, AlertTriangle, Droplets, Database } from 'lucide-react'

interface WeatherDisplayProps {
  lat: number
  lon: number
  policyThreshold?: number
}

export function WeatherDisplayNew({ lat, lon, policyThreshold }: WeatherDisplayProps) {
  const { data, loading, error, refetch } = useWeatherData(lat, lon)
  const { submitCurrentWeather, isSubmitting } = useWeatherOracle()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading weather data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Weather Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => refetch(lat, lon)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">No weather data available</p>
        </CardContent>
      </Card>
    )
  }

  const currentRainfall = data.current || 0
  const isAboveThreshold = policyThreshold ? currentRainfall > policyThreshold : false

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="h-5 w-5" />
          Live Weather Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Rainfall */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Current Rainfall</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {currentRainfall.toFixed(2)} mm
            </span>
          </div>

          {/* Policy Threshold Comparison */}
          {policyThreshold !== undefined && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Policy Threshold</span>
                <span className="text-sm font-bold text-gray-600">
                  {policyThreshold.toFixed(2)} mm
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <span className={`text-sm font-bold ${isAboveThreshold ? 'text-red-600' : 'text-green-600'}`}>
                  {isAboveThreshold ? '⚠️ Above Threshold' : '✅ Below Threshold'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${isAboveThreshold ? 'bg-red-600' : 'bg-green-600'}`}
                    style={{ width: `${Math.min((currentRainfall / policyThreshold) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {((currentRainfall / policyThreshold) * 100).toFixed(1)}% of threshold
                </p>
              </div>
            </div>
          )}

          {/* Location Info */}
          <div className="border-t pt-3">
            <p className="text-xs text-gray-600">
              Location: {data.location.lat.toFixed(4)}, {data.location.lon.toFixed(4)}
            </p>
            <p className="text-xs text-gray-600">
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => refetch(lat, lon)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Refresh
            </button>
            
            <button 
              onClick={() => submitCurrentWeather(lat, lon)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Database className="h-4 w-4" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit to Oracle'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
