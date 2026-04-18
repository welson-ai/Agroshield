import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther } from 'viem'
import { useTransactionToast } from './useTransactionToast'

export function usePolicyMarketplace() {
  const contractAddress = AGROSHIELD_CONTRACTS.CELO.MARKETPLACE
  const contractAbi = AGROSHIELD_ABIS.MARKETPLACE
  const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useTransactionToast()

  // Read functions
  const { data: activeListings, ...activeListingsRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getActiveListings',
  })

  const { data: sellerListings, ...sellerListingsRead } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getListingsBySeller',
    args: ['0x'], // Pass seller address as argument
  })

  // Write functions
  const { data: writeData, writeContract, ...writeContractState } = useWriteContract()

  const listPolicy = async (policyId: number, price: string, durationDays: number) => {
    try {
      showLoadingToast('Listing policy on marketplace...')
      const priceInWei = parseEther(price)
      const durationInSeconds = durationDays * 24 * 60 * 60
      
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'listPolicy',
        args: [policyId, priceInWei, durationInSeconds],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to list policy')
      throw error
    }
  }

  const delistPolicy = async (listingId: number) => {
    try {
      showLoadingToast('Delisting policy...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'delistPolicy',
        args: [listingId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to delist policy')
      throw error
    }
  }

  const makeOffer = async (listingId: number, amount: string) => {
    try {
      showLoadingToast('Making offer...')
      const amountInWei = parseEther(amount)
      
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'makeOffer',
        args: [listingId, amountInWei],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to make offer')
      throw error
    }
  }

  const acceptOffer = async (listingId: number, offerId: number) => {
    try {
      showLoadingToast('Accepting offer...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'acceptOffer',
        args: [listingId, offerId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to accept offer')
      throw error
    }
  }

  const buyPolicy = async (listingId: number) => {
    try {
      showLoadingToast('Buying policy...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'buyPolicy',
        args: [listingId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to buy policy')
      throw error
    }
  }

  const withdrawOffer = async (listingId: number, offerId: number) => {
    try {
      showLoadingToast('Withdrawing offer...')
      const hash = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'withdrawOffer',
        args: [listingId, offerId],
      })
      
      showLoadingToast('Transaction pending...')
      return hash
    } catch (error) {
      showErrorToast('Failed to withdraw offer')
      throw error
    }
  }

  const getListing = async (listingId: number) => {
    try {
      const listing = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getListing',
        args: [listingId],
      })
      return listing
    } catch (error) {
      console.error('Failed to get listing:', error)
      return null
    }
  }

  const getOffers = async (listingId: number) => {
    try {
      const offers = await useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'getOffersByListing',
        args: [listingId],
      })
      return offers
    } catch (error) {
      console.error('Failed to get offers:', error)
      return []
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
    activeListings,
    sellerListings,
    
    // Read states
    isLoadingRead: activeListingsRead.isLoading || sellerListingsRead.isLoading,
    readError: activeListingsRead.error || sellerListingsRead.error,
    
    // Write functions
    listPolicy,
    delistPolicy,
    makeOffer,
    acceptOffer,
    buyPolicy,
    withdrawOffer,
    getListing,
    getOffers,
    
    // Write states
    isWriting: writeContractState.isPending,
    writeError: writeContractState.error,
    transactionHash: writeData,
    isConfirming: waitState.isLoading,
    isConfirmed: !!receipt,
    confirmationReceipt: receipt,
  }
}

export type Listing = {
  policyId: bigint
  seller: string
  price: bigint
  isActive: boolean
  createdAt: bigint
  expiresAt: bigint
}

export type Offer = {
  listingId: bigint
  buyer: string
  amount: bigint
  isActive: boolean
  createdAt: bigint
}
