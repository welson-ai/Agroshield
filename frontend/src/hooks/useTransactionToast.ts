'use client'

import { toast } from 'react-hot-toast'
import { useWaitForTransactionReceipt } from 'wagmi'

export function useTransactionToast() {
  const { data: receipt, isLoading, error } = useWaitForTransactionReceipt({
    hash: undefined, // Will be set when transaction is submitted
  })

  // Show loading toast when transaction is pending
  if (isLoading) {
    toast.loading('Transaction pending...', {
      id: 'transaction-pending',
    })
  }

  // Show success toast when transaction is confirmed
  if (receipt && receipt.status === 'success') {
    const celoscanUrl = `https://celoscan.io/tx/${receipt.transactionHash}`
    
    toast.success('Transaction confirmed!', {
      id: receipt.transactionHash,
      duration: 5000,
    })
  }

  // Show error toast when transaction fails
  if (error) {
    toast.error('Transaction failed. Please try again.', {
      id: 'transaction-error',
    })
  }

  return {
    showSuccessToast: (message: string, txHash?: string) => {
      const celoscanUrl = txHash ? `https://celoscan.io/tx/${txHash}` : undefined
      const displayMessage = txHash ? `${message} - View on CeloScan` : message
      
      toast.success(displayMessage, {
        id: txHash || 'success',
        duration: 5000,
      })
    },
    showErrorToast: (message: string) => {
      toast.error(message, {
        id: 'error',
        duration: 6000,
      })
    },
    showLoadingToast: (message: string) => {
      toast.loading(message, {
        id: 'loading',
        duration: 3000,
      })
    },
    dismissToast: () => {
      toast.dismiss('transaction-pending')
      toast.dismiss('transaction-error')
      toast.dismiss('success')
      toast.dismiss('loading')
      toast.dismiss('error')
    },
  }
}
