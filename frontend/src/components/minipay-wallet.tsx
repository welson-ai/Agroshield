'use client'

import { useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { useMiniPay } from '@/hooks'
import { Button } from '@/components/ui/button'
import { formatEther } from 'viem'

export function MiniPayWallet() {
  const { address, isConnected } = useAccount()
  const { 
    isMiniPay, 
    isAutoConnecting, 
    isMiniPayConnected, 
    error, 
    disconnectMiniPay,
    getDefaultToken,
    isCeloMainnet 
  } = useMiniPay()

  const { data: balance } = useBalance({
    address,
    token: getDefaultToken().address as `0x${string}`,
  })

  // Show MiniPay branding and connection status
  if (!isMiniPay) {
    return null // Don't render anything if not MiniPay
  }

  if (isAutoConnecting) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-blue-800">Connecting to MiniPay...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
        <span className="text-sm text-red-800">MiniPay connection failed</span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!isConnected || !isMiniPayConnected) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
        <span className="text-sm text-orange-800">MiniPay wallet not connected</span>
        <Button 
          size="sm" 
          onClick={() => window.location.reload()}
        >
          Connect MiniPay
        </Button>
      </div>
    )
  }

  // Show connected MiniPay wallet info
  return (
    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">MP</span>
        </div>
        <div>
          <div className="text-xs text-green-600 font-medium">MiniPay Wallet</div>
          <div className="text-sm font-medium text-gray-900">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-xs text-gray-600">cUSD Balance</div>
          <div className="text-sm font-medium text-gray-900">
            {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} cUSD` : '0.0000 cUSD'}
          </div>
        </div>
        
        {isCeloMainnet() ? (
          <div className="text-xs text-green-600 font-medium">Celo Mainnet</div>
        ) : (
          <div className="text-xs text-orange-600 font-medium">Wrong Network</div>
        )}
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={disconnectMiniPay}
        >
          Disconnect
        </Button>
      </div>
    </div>
  )
}
