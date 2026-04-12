import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { useTransactionToast } from './useTransactionToast'

export function useAgroShieldOracle() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.ORACLE
  const contractAbi = AGROSHIELD_ABIS.ORACLE
  const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useTransactionToast()

  // Read functions
  const { data: pendingVerificationsCount, ...pendingVerificationsCountRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getPendingVerificationsCount',
  })

  const { data: weatherData, ...weatherDataRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getWeatherData',
    args: [1001, 1640000000], // location and timestamp
  })

  const { data: latestWeatherData, ...latestWeatherDataRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getLatestWeatherData',
    args: [1001], // location
  })

  const { data: isAuthorizedProvider, ...isAuthorizedProviderRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'authorizedProviders',
    args: ['0x'], // Pass user address as argument
  })

  // Write functions
  const { data: writeData, writeContract, ...writeContractState } = useWriteContract()

  const submitWeatherData = async (
    location: string,
    timestamp: string,
    rainfall: string,
    temperature: string,
    humidity: string
  ) => {
    try {
      showLoadingToast('Submitting weather data...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'submitWeatherData',
        args: [
          BigInt(location),
          BigInt(timestamp),
          BigInt(rainfall),
          BigInt(temperature),
          BigInt(humidity)
        ],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to submit weather data')
      throw error
    }
  }

  const setPolicyContract = async (policyAddress: string) => {
    try {
      showLoadingToast('Setting policy contract...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'setPolicyContract',
        args: [policyAddress],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to set policy contract')
      throw error
    }
  }

  const authorizeProvider = async (providerAddress: string) => {
    try {
      showLoadingToast('Authorizing provider...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'authorizeProvider',
        args: [providerAddress],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to authorize provider')
      throw error
    }
  }

  const manualPayoutTrigger = async (
    policyId: string,
    location: string,
    actualRainfall: string,
    threshold: string
  ) => {
    try {
      showLoadingToast('Triggering manual payout...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'manualPayoutTrigger',
        args: [
          BigInt(policyId),
          BigInt(location),
          BigInt(actualRainfall),
          BigInt(threshold)
        ],
      })
      
      // Show pending toast
      showLoadingToast('Transaction pending...')
      
      return hash
    } catch (error) {
      showErrorToast('Failed to trigger manual payout')
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
    pendingVerificationsCount,
    weatherData,
    latestWeatherData,
    isAuthorizedProvider,
    
    // Read states
    isLoadingRead: pendingVerificationsCountRead.isLoading || weatherDataRead.isLoading || latestWeatherDataRead.isLoading || isAuthorizedProviderRead.isLoading,
    readError: pendingVerificationsCountRead.error || weatherDataRead.error || latestWeatherDataRead.error || isAuthorizedProviderRead.error,
    
    // Write functions
    submitWeatherData,
    setPolicyContract,
    authorizeProvider,
    manualPayoutTrigger,
    
    // Write states
    isWriting: writeContractState.isPending,
    writeError: writeContractState.error,
    transactionHash: writeData,
    isConfirming: waitState.isLoading,
    isConfirmed: !!receipt,
    confirmationReceipt: receipt,
  }
}
