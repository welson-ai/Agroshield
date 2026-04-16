'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgroShieldOracle } from '@/hooks'

export function WeatherDisplay() {
  const { latestWeatherData, isLoadingRead, readError } = useAgroShieldOracle()

  if (isLoadingRead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (readError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <div className="mb-4">⚠️</div>
            <p>Failed to load weather data</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!latestWeatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">🌤️</div>
            <p>No weather data available</p>
            <p className="text-sm">Data will appear here once submitted</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { rainfall, temperature, humidity, timestamp, verified } = latestWeatherData || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Current Weather Data
          {verified && (
            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Verified
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Latest weather oracle data for your location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-1">💧</div>
            <div className="text-sm text-gray-600">Rainfall</div>
            <div className="text-xl font-bold text-blue-600">{rainfall}mm</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl mb-1">🌡️</div>
            <div className="text-sm text-gray-600">Temperature</div>
            <div className="text-xl font-bold text-orange-600">{temperature}°C</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-1">💨</div>
            <div className="text-sm text-gray-600">Humidity</div>
            <div className="text-xl font-bold text-purple-600">{humidity}%</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-sm text-gray-600">Last Updated</div>
            <div className="text-sm font-medium">
              {new Date(Number(timestamp) * 1000).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-green-800 text-sm">
            <div className="font-medium mb-1">📊 Data Status</div>
            <div>Weather data is verified and ready for policy evaluation</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
