import { useState, useEffect } from 'react'

interface WeatherData {
  current: number
  hourly: number[]
  location: {
    lat: number
    lon: number
  }
  timestamp: number
}

interface WeatherResponse {
  success: boolean
  data?: WeatherData
  error?: string
}

export function useWeatherData(lat?: number, lon?: number) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/weather?lat=${latitude}&lon=${longitude}`
      )
      
      const result: WeatherResponse = await response.json()
      
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch weather data')
      }
    } catch (err) {
      setError('Network error while fetching weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (lat && lon) {
      fetchWeatherData(lat, lon)
    }
  }, [lat, lon])

  return {
    data,
    loading,
    error,
    refetch: fetchWeatherData
  }
}
