'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { MiniPayWallet } from '@/components/minipay-wallet'
import { useAccount, useBalance } from 'wagmi'
import { useMiniPay } from '@/hooks'
import { formatEther } from 'viem'

/**
 * Navbar component - Main navigation header for AgroShield application
 * Includes wallet connection, balance display, and navigation links
 * 
 * @returns JSX.Element - Responsive navigation header with wallet integration
 * 
 * @example
 * <Navbar />
 */
export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address,
  })
  const { isMiniPay } = useMiniPay()

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
            <Link href="/marketplace" className="text-sm font-medium hover:text-primary">
              Marketplace
            </Link>
            <Link href="/premium-calculator" className="text-sm font-medium hover:text-primary">
              Premium Calculator
            </Link>
            <Link href="/multi-crop" className="text-sm font-medium hover:text-primary">
              Multi-Crop
            </Link>
            <Link href="/weather-prediction" className="text-sm font-medium hover:text-primary">
              Weather
            </Link>
            <Link href="/staking" className="text-sm font-medium hover:text-primary">
              Staking
            </Link>
            <Link href="/transaction-spinning" className="text-sm font-medium hover:text-primary text-yellow-600">
              ⚡ Spinning
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-primary">
              Admin
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className={`w-5 h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-5 h-0.5 bg-gray-600 transition-all my-1 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-5 h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Show MiniPay wallet if MiniPay browser */}
          {isMiniPay ? (
            <MiniPayWallet />
          ) : (
            /* Show regular RainbowKit wallet for non-MiniPay browsers */
            <>
              {isConnected && address && isMounted ? (
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
            </>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-2">
            <Link 
              href="/dashboard" 
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/pool" 
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pool
            </Link>
            <Link 
              href="/marketplace" 
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              href="/premium-calculator" 
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Premium Calculator
            </Link>
            <Link 
              href="/multi-crop" 
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Multi-Crop
            </Link>
            <Link 
              href="/weather-prediction" 
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Weather
            </Link>
            <Link 
              href="/staking" 
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Staking
            </Link>
            <Link 
              href="/transaction-spinning" 
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md text-yellow-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ⚡ Spinning
            </Link>
            <Link 
              href="/admin" 
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
