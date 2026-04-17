import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { useTransactionToast } from '@/hooks'
import { useWeatherData } from '@/hooks'

interface WeatherOracleData {
  rainfall: number
  temperature: number
  humidity: number
  location: {
    lat: number
    lon: number
  }
  timestamp: number
}

export function useWeatherOracle() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  const { showTransactionToast } = useTransactionToast()

  const submitWeatherToOracle = async (
    weatherData: WeatherOracleData
  ): Promise<string | null> => {
    if (!address) {
      alert('Please connect your wallet first')
      return null
    }

    setIsSubmitting(true)

    try {
      const txHash = await writeContract({
        address: AGROSHIELD_CONTRACTS.CELO.ORACLE as `0x${string}`,
        abi: AGROSHIELD_ABIS.ORACLE,
        functionName: 'submitWeatherData',
        args: [
          weatherData.location.lat.toString(),
          weatherData.timestamp.toString(),
          weatherData.rainfall.toString(),
          weatherData.temperature.toString(),
          weatherData.humidity.toString()
        ]
      })

      if (txHash) {
        showTransactionToast(
          txHash,
          'Weather data submitted to oracle',
          'Weather data successfully recorded on blockchain'
        )
        return txHash
      }

      return null
    } catch (error) {
      console.error('Failed to submit weather data:', error)
      alert('Failed to submit weather data to oracle')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitCurrentWeather = async (lat: number, lon: number): Promise<string | null> => {
    // Fetch current weather data
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
    const result = await response.json()

    if (!result.success) {
      alert('Failed to fetch weather data')
      return null
    }

    const weatherData: WeatherOracleData = {
      rainfall: result.data.current || 0,
      temperature: 25, // Default temperature (would need from API)
      humidity: 60, // Default humidity (would need from API)
      location: result.data.location,
      timestamp: Math.floor(Date.now() / 1000)
    }

    return submitWeatherToOracle(weatherData)
  }

  return {
    submitWeatherToOracle,
    submitCurrentWeather,
    isSubmitting
  }
}
