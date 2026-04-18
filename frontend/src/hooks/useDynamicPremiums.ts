import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther } from 'viem'
import { useTransactionToast } from './useTransactionToast'

export function useDynamicPremiums() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.DYNAMIC_PREMIUMS
  const contractAbi = AGROSHIELD_ABIS.DYNAMIC_PREMIUMS
  const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useTransactionToast()

  // Read functions
  const { data: activeLocations, ...activeLocationsRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getActiveLocations',
  })

  const { data: activeCrops, ...activeCropsRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getActiveCrops',
  })

  // Write functions
  const { data: writeData, writeContract, ...writeContractState } = useWriteContract()

  const calculateDynamicPremium = async (
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
        functionName: 'calculateDynamicPremium',
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
      console.error('Failed to calculate premium:', error)
      return null
    }
  }

  const getLocationRiskFactor = async (location: string) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getLocationRiskFactor',
        args: [location],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get location risk factor:', error)
      return null
    }
  }

  const getCropRiskProfile = async (cropType: string) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getCropRiskProfile',
        args: [cropType],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get crop risk profile:', error)
      return null
    }
  }

  const updateLocationRiskFactor = async (
    location: string,
    riskScore: number,
    variance: number,
    droughtFreq: number,
    floodFreq: number
  ) => {
    try {
      showLoadingToast('Updating location risk factor...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'updateLocationRiskFactor',
        args: [location, riskScore, variance, droughtFreq, floodFreq],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to update location risk factor')
      throw error
    }
  }

  const updateCropRiskProfile = async (
    cropType: string,
    riskMultiplier: number,
    premiumRate: number,
    sensitivityFactor: number
  ) => {
    try {
      showLoadingToast('Updating crop risk profile...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'updateCropRiskProfile',
        args: [cropType, riskMultiplier, premiumRate, sensitivityFactor],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to update crop risk profile')
      throw error
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
    // Read data
    activeLocations,
    activeCrops,
    
    // Read states
    isLoadingRead: activeLocationsRead.isLoading || activeCropsRead.isLoading,
    readError: activeLocationsRead.error || activeCropsRead.error,
    
    // Write functions
    calculateDynamicPremium,
    getLocationRiskFactor,
    getCropRiskProfile,
    updateLocationRiskFactor,
    updateCropRiskProfile,
    
    // Write states
    isWriting: writeContractState.isPending,
    writeError: writeContractState.error,
    transactionHash: writeData,
    isConfirming: waitState.isLoading,
    isConfirmed: !!receipt,
    confirmationReceipt: receipt,
  }
}

export type RiskFactor = {
  location: string
  baseRiskScore: bigint
  historicalRainfallVariance: bigint
  droughtFrequency: bigint
  floodFrequency: bigint
  lastUpdated: bigint
  isActive: boolean
}

export type CropRiskProfile = {
  cropType: string
  riskMultiplier: bigint
  basePremiumRate: bigint
  sensitivityFactor: bigint
  isActive: boolean
}

export type PremiumCalculation = {
  basePremium: bigint
  riskAdjustment: bigint
  locationFactor: bigint
  cropFactor: bigint
  seasonalFactor: bigint
  finalPremium: bigint
  calculatedAt: bigint
}
