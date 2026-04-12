import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther, formatEther } from 'viem'

export function useAgroShieldPolicy() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.POLICY
  const contractAbi = AGROSHIELD_ABIS.POLICY

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

  const createPolicy = (
    coverageAmount: string,
    rainfallThreshold: string,
    measurementPeriod: string,
    location: string
  ) => {
    return writeContract({
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
  }

  const payPremium = (policyId: number) => {
    return writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'payPremium',
      args: [policyId],
    })
  }

  const setOracleContract = (oracleAddress: string) => {
    return writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'setOracleContract',
      args: [oracleAddress],
    })
  }

  const { data: receipt, ...waitState } = useWaitForTransactionReceipt({
    hash: writeData,
  })

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
