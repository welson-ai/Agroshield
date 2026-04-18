import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther } from 'viem'
import { useTransactionToast } from './useTransactionToast'

export function useMultiCropPolicy() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.MULTI_CROP_POLICY
  const contractAbi = AGROSHIELD_ABIS.MULTI_CROP_POLICY
  const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useTransactionToast()

  // Write functions
  const { data: writeData, writeContract, ...writeContractState } = useWriteContract()

  const createMultiCropPolicy = async (
    crops: CropEntry[],
    location: string,
    measurementPeriod: number,
    description: string
  ) => {
    try {
      showLoadingToast('Creating multi-crop policy...')
      
      // Convert crops to contract format
      const contractCrops = crops.map(crop => ({
        cropType: crop.cropType,
        coverageAmount: parseEther(crop.coverageAmount),
        rainfallThreshold: crop.rainfallThreshold,
        weight: crop.weight
      }))
      
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createMultiCropPolicy',
        args: [contractCrops, location, measurementPeriod, description],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to create multi-crop policy')
      throw error
    }
  }

  const payMultiCropPremium = async (policyId: number) => {
    try {
      showLoadingToast('Paying multi-crop premium...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'payMultiCropPremium',
        args: [policyId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to pay premium')
      throw error
    }
  }

  const processCropPayout = async (policyId: number, cropIndex: number) => {
    try {
      showLoadingToast('Processing crop payout...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'processCropPayout',
        args: [policyId, cropIndex],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to process crop payout')
      throw error
    }
  }

  const processAllCropPayouts = async (policyId: number) => {
    try {
      showLoadingToast('Processing all crop payouts...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'processAllCropPayouts',
        args: [policyId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to process all crop payouts')
      throw error
    }
  }

  const getMultiCropPolicy = async (policyId: number) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getMultiCropPolicy',
        args: [policyId],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get multi-crop policy:', error)
      return null
    }
  }

  const getFarmerMultiCropPolicies = async (farmerAddress: string) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getFarmerMultiCropPolicies',
        args: [farmerAddress],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get farmer multi-crop policies:', error)
      return []
    }
  }

  const calculateBundlePremium = async (
    crops: CropEntry[],
    location: string,
    measurementPeriod: number
  ) => {
    try {
      // Convert crops to contract format
      const contractCrops = crops.map(crop => ({
        cropType: crop.cropType,
        coverageAmount: parseEther(crop.coverageAmount),
        rainfallThreshold: crop.rainfallThreshold,
        weight: crop.weight
      }))
      
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'calculateBundlePremium',
        args: [contractCrops, location, measurementPeriod],
      })
      
      return result
    } catch (error) {
      console.error('Failed to calculate bundle premium:', error)
      return null
    }
  }

  const getMultiCropPolicySummary = async (policyId: number) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getMultiCropPolicySummary',
        args: [policyId],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get policy summary:', error)
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
    createMultiCropPolicy,
    payMultiCropPremium,
    processCropPayout,
    processAllCropPayouts,
    getMultiCropPolicy,
    getFarmerMultiCropPolicies,
    calculateBundlePremium,
    getMultiCropPolicySummary,
    
    // Write states
    isWriting: writeContractState.isPending,
    writeError: writeContractState.error,
    transactionHash: writeData,
    isConfirming: waitState.isLoading,
    isConfirmed: !!receipt,
    confirmationReceipt: receipt,
  }
}

export type CropEntry = {
  cropType: string
  coverageAmount: string
  rainfallThreshold: number
  weight: number // 10000 = 100%
}

export type MultiCropPolicyData = {
  policyId: bigint
  farmer: string
  crops: CropEntry[]
  totalCoverage: bigint
  totalPremium: bigint
  location: string
  measurementPeriod: bigint
  createdAt: bigint
  premiumPaidAt: bigint
  isActive: boolean
  isPaid: boolean
  description: string
}

export type PolicySummary = {
  totalCoverage: bigint
  totalPremium: bigint
  cropCount: bigint
  paidCrops: bigint
  isActive: boolean
  isPaid: boolean
}
