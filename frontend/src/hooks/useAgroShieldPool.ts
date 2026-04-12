import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther, formatEther } from 'viem'

export function useAgroShieldPool() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.POOL
  const contractAbi = AGROSHIELD_ABIS.POOL

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

  const provideLiquidity = (amount: string) => {
    const amountInWei = parseEther(amount)
    return writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'provideLiquidity',
      args: [amountInWei],
    })
  }

  const withdrawLiquidity = (amount: string) => {
    const amountInWei = parseEther(amount)
    return writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'withdrawLiquidity',
      args: [amountInWei],
    })
  }

  const authorizePolicy = (policyAddress: string) => {
    return writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'authorizePolicy',
      args: [policyAddress],
    })
  }

  const { data: receipt, ...waitState } = useWaitForTransactionReceipt({
    hash: writeData,
  })

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
