'use client'

import { useAccount, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function WalletInfo() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address,
  })

  if (!isConnected || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Not Connected</CardTitle>
          <CardDescription>
            Connect your wallet to interact with AgroShield
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-black">
            <div className="mb-4">🔌</div>
            <p>Connect your wallet to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Information</CardTitle>
        <CardDescription>
          Your connected wallet details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-black">Address</div>
          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
            {address}
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium text-black">CELO Balance</div>
          <div className="text-2xl font-bold">
            {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} CELO` : '0.0000 CELO'}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-black">Network</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Celo Mainnet</span>
            <span className="text-xs text-gray-500">(Chain ID: 42220)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
