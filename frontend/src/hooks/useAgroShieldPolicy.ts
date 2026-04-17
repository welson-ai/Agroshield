import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther } from 'viem'
import { useTransactionToast } from './useTransactionToast'

export function useAgroShieldPolicy() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.POLICY
  const contractAbi = AGROSHIELD_ABIS.POLICY
  const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useTransactionToast()

  // Read functions
  const { data: nextPolicyId, ...nextPolicyIdRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'nextPolicyId',
  })

  const { data: activePoliciesCount, ...activePoliciesCountRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getActivePoliciesCount',
  })

  const { data: userPolicies, ...userPoliciesRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getFarmerPolicies',
    args: ['0x'], // Pass user address as argument
  })

  const { data: policy, ...policyRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getPolicy',
    args: [1], // Pass policy ID as argument
  })

  // Write functions
  const { data: writeData, writeContract, ...writeContractState } = useWriteContract()

  const createPolicy = async (
    coverageAmount: string,
    rainfallThreshold: string,
    measurementPeriod: string,
    location: string
  ) => {
    try {
      showLoadingToast('Creating policy...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createPolicy',
        args: [
          parseEther(coverageAmount),
          BigInt(rainfallThreshold),
          BigInt(measurementPeriod),
          BigInt(location)
        ],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to create policy')
      throw error
    }
  }

  const payPremium = async (policyId: number) => {
    try {
      showLoadingToast('Paying premium...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'payPremium',
        args: [policyId],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to pay premium')
      throw error
    }
  }

  const setOracleContract = async (oracleAddress: string) => {
    try {
      showLoadingToast('Setting oracle contract...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'setOracleContract',
        args: [oracleAddress],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to set oracle contract')
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
    nextPolicyId,
    activePoliciesCount,
    userPolicies,
    policy,
    
    // Read states
    isLoadingRead: nextPolicyIdRead.isLoading || activePoliciesCountRead.isLoading || userPoliciesRead.isLoading || policyRead.isLoading,
    readError: nextPolicyIdRead.error || activePoliciesCountRead.error || userPoliciesRead.error || policyRead.error,
    
    // Write functions
    createPolicy,
    payPremium,
    setOracleContract,
    
    // Write states
    isWriting: writeContractState.isPending,
    writeError: writeContractState.error,
    transactionHash: writeData,
    isConfirming: waitState.isLoading,
    isConfirmed: !!receipt,
    confirmationReceipt: receipt,
  }
}
