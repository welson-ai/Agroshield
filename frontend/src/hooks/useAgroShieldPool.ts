import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther } from 'viem'
import { useTransactionToast } from './useTransactionToast'

export function useAgroShieldPool() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.POOL
  const contractAbi = AGROSHIELD_ABIS.POOL
  const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useTransactionToast()

  // Read functions
  const { data: totalLiquidity, ...totalLiquidityRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'totalLiquidity',
  })

  const { data: reserveRatio, ...reserveRatioRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'reserveRatio',
  })

  const { data: userShares, ...userSharesRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getUserShares',
    args: ['0x'], // Pass user address as argument
  })

  // Write functions
  const { data: writeData, writeContract, ...writeContractState } = useWriteContract()

  const provideLiquidity = async (amount: string) => {
    try {
      showLoadingToast('Depositing liquidity...')
      const amountInWei = parseEther(amount)
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'provideLiquidity',
        args: [amountInWei],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to deposit liquidity')
      throw error
    }
  }

  const withdrawLiquidity = async (amount: string) => {
    try {
      showLoadingToast('Withdrawing liquidity...')
      const amountInWei = parseEther(amount)
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'withdrawLiquidity',
        args: [amountInWei],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to withdraw liquidity')
      throw error
    }
  }

  const authorizePolicy = async (policyAddress: string) => {
    try {
      showLoadingToast('Authorizing policy...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'authorizePolicy',
        args: [policyAddress],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to authorize policy')
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
    totalLiquidity,
    reserveRatio,
    userShares,
    
    // Read states
    isLoadingRead: totalLiquidityRead.isLoading || reserveRatioRead.isLoading || userSharesRead.isLoading,
    readError: totalLiquidityRead.error || reserveRatioRead.error || userSharesRead.error,
    
    // Write functions
    provideLiquidity,
    withdrawLiquidity,
    authorizePolicy,
    
    // Write states
    isWriting: writeContractState.isPending,
    writeError: writeContractState.error,
    transactionHash: writeData,
    isConfirming: waitState.isLoading,
    isConfirmed: !!receipt,
    confirmationReceipt: receipt,
  }
}
