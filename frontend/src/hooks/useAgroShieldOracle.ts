import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'

export function useAgroShieldOracle() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.ORACLE
  const contractAbi = AGROSHIELD_ABIS.ORACLE

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

  const submitWeatherData = (
    location: string,
    timestamp: string,
    rainfall: string,
    temperature: string,
    humidity: string
  ) => {
    return writeContract({
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
  }

  const setPolicyContract = (policyAddress: string) => {
    return writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'setPolicyContract',
      args: [policyAddress],
    })
  }

  const authorizeProvider = (providerAddress: string) => {
    return writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'authorizeProvider',
      args: [providerAddress],
    })
  }

  const manualPayoutTrigger = (
    policyId: string,
    location: string,
    actualRainfall: string,
    threshold: string
  ) => {
    return writeContract({
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
  }

  const { data: receipt, ...waitState } = useWaitForTransactionReceipt({
    hash: writeData,
  })

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
