import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther } from 'viem'
import { useTransactionToast } from './useTransactionToast'

export function useWeatherPrediction() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.WEATHER_PREDICTION
  const contractAbi = AGROSHIELD_ABIS.WEATHER_PREDICTION
  const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useTransactionToast()

  // Write functions
  const { data: writeData, writeContract, ...writeContractState } = useWriteContract()

  const submitWeatherPrediction = async (
    location: string,
    timestamp: number,
    predictedRainfall: number,
    confidence: number,
    predictionPeriod: number,
    dataSource: string
  ) => {
    try {
      showLoadingToast('Submitting weather prediction...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'submitWeatherPrediction',
        args: [location, timestamp, predictedRainfall, confidence, predictionPeriod, dataSource],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to submit weather prediction')
      throw error
    }
  }

  const validatePrediction = async (
    location: string,
    predictionIndex: number,
    actualRainfall: number
  ) => {
    try {
      showLoadingToast('Validating prediction...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'validatePrediction',
        args: [location, predictionIndex, actualRainfall],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to validate prediction')
      throw error
    }
  }

  const calculatePremiumWithPrediction = async (
    coverageAmount: string,
    location: string,
    cropType: string,
    measurementPeriod: number,
    rainfallThreshold: number
  ) => {
    try {
      const coverageInWei = parseEther(coverageAmount)
      
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'calculatePremiumWithPrediction',
        args: [
          coverageInWei,
          location,
          cropType,
          measurementPeriod,
          rainfallThreshold
        ],
      })
      
      return result
    } catch (error) {
      console.error('Failed to calculate premium with prediction:', error)
      return null
    }
  }

  const getLocationPredictions = async (location: string) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getLocationPredictions',
        args: [location],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get location predictions:', error)
      return []
    }
  }

  const getActivePredictions = async (location: string) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getActivePredictions',
        args: [location],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get active predictions:', error)
      return []
    }
  }

  const getPredictionAccuracy = async (location: string) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getPredictionAccuracy',
        args: [location],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get prediction accuracy:', error)
      return null
    }
  }

  const getPredictionStats = async () => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getPredictionStats',
        args: [],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get prediction stats:', error)
      return null
    }
  }

  const { data: receipt, ...waitState } = useWaitForTransactionReceipt({
    hash: writeData,
  })

  // Show success/error toasts based on transaction status
  if (receipt && receipt.status === 'success') {
    dismissToast()
    showSuccessToast('Transaction confirmed!', receipt.transactionHash)
  } else if (receipt && receipt.status === 'reverted') {
    dismissToast()
    showErrorToast('Transaction failed')
  }

  return {
    // Write functions
    submitWeatherPrediction,
    validatePrediction,
    calculatePremiumWithPrediction,
    getLocationPredictions,
    getActivePredictions,
    getPredictionAccuracy,
    getPredictionStats,
    
    // Write states
    isWriting: writeContractState.isPending,
    writeError: writeContractState.error,
    transactionHash: writeData,
    isConfirming: waitState.isLoading,
    isConfirmed: !!receipt,
    confirmationReceipt: receipt,
  }
}

export type WeatherPrediction = {
  location: string
  timestamp: bigint
  predictedRainfall: bigint
  confidence: bigint
  predictionPeriod: bigint
  dataSource: string
  createdAt: bigint
  isActive: boolean
}

export type PredictionAccuracy = {
  location: string
  totalPredictions: bigint
  accuratePredictions: bigint
  averageError: bigint
  lastUpdated: bigint
}

export type PremiumAdjustment = {
  basePremium: bigint
  predictionAdjustment: bigint
  finalPremium: bigint
  confidence: bigint
  reasoning: string
}

export type PredictionStats = {
  totalPredictions: bigint
  activePredictions: bigint
  averageAccuracy: bigint
  locationsCovered: bigint
}
