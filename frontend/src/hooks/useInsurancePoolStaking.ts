import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther } from 'viem'
import { useTransactionToast } from './useTransactionToast'

export function useInsurancePoolStaking() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.INSURANCE_POOL_STAKING
  const contractAbi = AGROSHIELD_ABIS.INSURANCE_POOL_STAKING
  const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useTransactionToast()

  // Write functions
  const { data: writeData, writeContract, ...writeContractState } = useWriteContract()

  const createStakePosition = async (amount: string, tierId: number) => {
    try {
      showLoadingToast('Creating stake position...')
      const amountInWei = parseEther(amount)
      
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createStakePosition',
        args: [amountInWei, tierId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to create stake position')
      throw error
    }
  }

  const extendStakePosition = async (positionId: number) => {
    try {
      showLoadingToast('Extending stake position...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'extendStakePosition',
        args: [positionId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to extend stake position')
      throw error
    }
  }

  const claimRewards = async (positionId: number) => {
    try {
      showLoadingToast('Claiming rewards...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'claimRewards',
        args: [positionId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to claim rewards')
      throw error
    }
  }

  const withdrawStake = async (positionId: number) => {
    try {
      showLoadingToast('Withdrawing stake...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'withdrawStake',
        args: [positionId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to withdraw stake')
      throw error
    }
  }

  const getStakePositions = async (stakerAddress: string) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getStakePositions',
        args: [stakerAddress],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get stake positions:', error)
      return []
    }
  }

  const getStakerStats = async (stakerAddress: string) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getStakerStats',
        args: [stakerAddress],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get staker stats:', error)
      return null
    }
  }

  const getPoolStats = async () => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getPoolStats',
        args: [],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get pool stats:', error)
      return null
    }
  }

  const calculateRewards = async (positionId: number, stakerAddress: string) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'calculateRewards',
        args: [positionId, stakerAddress],
      })
      
      return result
    } catch (error) {
      console.error('Failed to calculate rewards:', error)
      return null
    }
  }

  const getStakingTier = async (tierId: number) => {
    try {
      const result = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getStakingTier',
        args: [tierId],
      })
      
      return result
    } catch (error) {
      console.error('Failed to get staking tier:', error)
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
    createStakePosition,
    extendStakePosition,
    claimRewards,
    withdrawStake,
    getStakePositions,
    getStakerStats,
    getPoolStats,
    calculateRewards,
    getStakingTier,
    
    // Write states
    isWriting: writeContractState.isPending,
    writeError: writeContractState.error,
    transactionHash: writeData,
    isConfirming: waitState.isLoading,
    isConfirmed: !!receipt,
    confirmationReceipt: receipt,
  }
}

export type StakePosition = {
  staker: string
  amount: bigint
  stakedAt: bigint
  lockPeriod: bigint
  rewardRate: bigint
  accumulatedRewards: bigint
  lastRewardCalculation: bigint
  isActive: boolean
  tier: bigint
}

export type StakingTier = {
  minAmount: bigint
  lockPeriod: bigint
  baseRewardRate: bigint
  bonusMultiplier: bigint
  tierName: string
  isActive: boolean
}

export type StakerStats = {
  totalStaked: bigint
  totalRewards: bigint
  activePositions: bigint
  averageTier: bigint
}

export type PoolStats = {
  totalStakedAmount: bigint
  totalRewardsAmount: bigint
  activeStakers: bigint
  averageLockPeriod: bigint
  currentRewardRate: bigint
}
