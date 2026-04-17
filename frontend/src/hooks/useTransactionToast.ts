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
      const displayMessage = txHash ? `${message}` : message
      
      toast.success(displayMessage, {
        id: txHash || 'success',
        duration: 5000,
        icon: '_">_',
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
        },
      })
      
      // Show secondary toast with transaction link if hash provided
      if (txHash) {
        setTimeout(() => {
          toast(
            (t) => (
              <div className="flex items-center space-x-2">
                <span>View on CeloScan</span>
                <button 
                  onClick={() => window.open(`https://celoscan.io/tx/${txHash}`, '_blank')}
                  className="underline hover:no-underline"
                >
                  {txHash.slice(0, 8)}...{txHash.slice(-6)}
                </button>
                <button onClick={() => toast.dismiss(t.id)} className="ml-2">
                  _">_
                </button>
              </div>
            ),
            {
              id: `${txHash}-link`,
              duration: 8000,
              icon: '_">_',
            }
          )
        }, 1000)
      }
    },
    showErrorToast: (message: string) => {
      toast.error(message, {
        id: 'error',
        duration: 6000,
        icon: '_">_',
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
        },
      })
    },
    showLoadingToast: (message: string) => {
      toast.loading(message, {
        id: 'loading',
        duration: 3000,
        icon: '_">_',
      })
    },
    showInfoToast: (message: string) => {
      toast(message, {
        id: 'info',
        duration: 4000,
        icon: '_">_',
        style: {
          background: '#3b82f6',
          color: 'white',
          border: '1px solid #2563eb',
        },
      })
    },
    showWalletToast: (message: string) => {
      toast(message, {
        id: 'wallet',
        duration: 3000,
        icon: '_">_',
        style: {
          background: '#8b5cf6',
          color: 'white',
          border: '1px solid #7c3aed',
        },
      })
    },
    dismissToast: () => {
      toast.dismiss('transaction-pending')
      toast.dismiss('transaction-error')
      toast.dismiss('success')
      toast.dismiss('loading')
      toast.dismiss('error')
      toast.dismiss('info')
      toast.dismiss('wallet')
    },
  }
}
