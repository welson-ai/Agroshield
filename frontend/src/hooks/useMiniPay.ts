'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

interface MiniPayState {
  isMiniPay: boolean
  isAutoConnecting: boolean
  isMiniPayConnected: boolean
  error: string | null
}

export function useMiniPay() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [state, setState] = useState<MiniPayState>({
    isMiniPay: false,
    isAutoConnecting: false,
    isMiniPayConnected: false,
    error: null
  })

  // Detect MiniPay browser
  useEffect(() => {
    const detectMiniPay = () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const isMiniPayBrowser = (window.ethereum as { isMiniPay?: boolean }).isMiniPay === true
          setState(prev => ({ ...prev, isMiniPay: isMiniPayBrowser }))
          
          // Auto-connect if MiniPay and not already connected
          if (isMiniPayBrowser && !isConnected && !isPending) {
            setState(prev => ({ ...prev, isAutoConnecting: true }))
            connect({
              connector: injected(),
            }).then(() => {
              setState(prev => ({ 
                ...prev, 
                isAutoConnecting: false,
                isMiniPayConnected: true 
              }))
            }).catch((error) => {
              console.error('Auto-connect to MiniPay failed:', error)
              setState(prev => ({ 
                ...prev, 
                isAutoConnecting: false,
                error: 'Failed to auto-connect to MiniPay' 
              }))
            })
          }
        }
      } catch (error) {
        console.error('Error detecting MiniPay:', error)
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to detect MiniPay browser' 
        }))
      }
    }

    detectMiniPay()
  }, [isConnected, isPending, connect])

  // Disconnect MiniPay if needed
  const disconnectMiniPay = () => {
    if (state.isMiniPay && isConnected) {
      disconnect()
      setState(prev => ({ 
        ...prev, 
        isMiniPayConnected: false 
      }))
    }
  }

  // Check if we should hide RainbowKit (MiniPay users)
  const shouldHideWalletUI = state.isMiniPay && state.isMiniPayConnected

  return {
    ...state,
    address,
    isConnected,
    disconnectMiniPay,
    shouldHideWalletUI,
    // Helper method to get cUSD token info for MiniPay
    getDefaultToken: () => ({
      symbol: 'cUSD',
      address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
      decimals: 18,
      name: 'Celo Dollar'
    }),
    // Helper to check if on Celo mainnet
    isCeloMainnet: () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        return (window.ethereum as { chainId?: string; networkVersion?: string }).chainId === '0xa4ec' || // 42220 in hex
               (window.ethereum as { chainId?: string; networkVersion?: string }).networkVersion === '42220'
      }
      return false
    }
  }
}

// Type declaration for window.ethereum extension
declare global {
  interface Window {
    ethereum?: Record<string, unknown> & {
      isMiniPay?: boolean
      chainId?: string
      networkVersion?: string
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}
