'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { useAccount, useBalance } from 'wagmi'
import { formatEther } from 'viem'

export function Navbar() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address,
  })

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AS</span>
            </div>
            <span className="font-bold text-xl">AgroShield</span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link href="/pool" className="text-sm font-medium hover:text-primary">
              Pool
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-primary">
              Admin
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {isConnected && address ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                <div className="font-medium">
                  {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} CELO` : '0.0000 CELO'}
                </div>
                <div className="text-xs">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              </div>
              <ConnectButton />
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </nav>
  )
}
