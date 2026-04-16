'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAgroShieldPool } from '@/hooks'
import { useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'

export function UserPosition() {
  const { address } = useAccount()
  const { userShares, totalLiquidity, provideLiquidity, withdrawLiquidity, isWriting, isConfirmed, confirmationReceipt } = useAgroShieldPool()
  
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showDepositSuccess, setShowDepositSuccess] = useState(false)
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false)

  const userLiquidityValue = userShares && totalLiquidity && typeof userShares === 'bigint' && typeof totalLiquidity === 'bigint' ? 
    (userShares * totalLiquidity) / BigInt(10000) : BigInt(0) // Assuming shares are basis points

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount')
      return
    }

    try {
      await provideLiquidity(depositAmount)
      setShowDepositSuccess(true)
      setDepositAmount('')
      
      setTimeout(() => setShowDepositSuccess(false), 3000)
    } catch (error) {
      console.error('Deposit failed:', error)
      alert('Deposit failed. Please try again.')
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid withdraw amount')
      return
    }

    if (userLiquidityValue && parseEther(withdrawAmount) > userLiquidityValue) {
      alert('Insufficient balance')
      return
    }

    try {
      await withdrawLiquidity(withdrawAmount)
      setShowWithdrawSuccess(true)
      setWithdrawAmount('')
      
      setTimeout(() => setShowWithdrawSuccess(false), 3000)
    } catch (error) {
      console.error('Withdraw failed:', error)
      alert('Withdraw failed. Please try again.')
    }
  }

  if (showDepositSuccess && isConfirmed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">✅ Deposit Successful!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-lg font-medium">
              Your liquidity has been added to the pool
            </div>
            <div className="text-sm text-black">
              Transaction Hash: {confirmationReceipt?.transactionHash?.slice(0, 10)}...
            </div>
            <Button 
              onClick={() => setShowDepositSuccess(false)}
              className="mt-4"
              variant="outline"
            >
              Make Another Deposit
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showWithdrawSuccess && isConfirmed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">✅ Withdrawal Successful!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <div className="text-6xl mb-4">💰</div>
            <div className="text-lg font-medium">
              Your withdrawal has been processed
            </div>
            <div className="text-sm text-black">
              Transaction Hash: {confirmationReceipt?.transactionHash?.slice(0, 10)}...
            </div>
            <Button 
              onClick={() => setShowWithdrawSuccess(false)}
              className="mt-4"
              variant="outline"
            >
              Make Another Withdrawal
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Position</CardTitle>
        <CardDescription>
          Manage your liquidity provision and earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Position */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-black">Your Shares</div>
              <div className="text-xl font-bold">
                {userShares ? `${Number(userShares) / 10000}%` : '0.00%'}
              </div>
            </div>
            <div>
              <div className="text-sm text-black">Liquidity Value</div>
              <div className="text-xl font-bold">
                {userLiquidityValue ? formatEther(userLiquidityValue) : '0.0000'} cUSD
              </div>
            </div>
          </div>
          
          <div className="text-sm text-black">
            <div className="font-medium mb-2">💰 Position Summary</div>
            <div className="space-y-1">
              <div>• Share of pool: {userShares ? `${Number(userShares) / 100}%` : '0.00%'}</div>
              <div>• Value in cUSD: {userLiquidityValue ? formatEther(userLiquidityValue) : '0.0000'}</div>
              <div>• Earnings from premiums: Accruing continuously</div>
            </div>
          </div>
        </div>

        {/* Deposit Form */}
        <div>
          <h4 className="font-medium mb-3">Add Liquidity</h4>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <Label htmlFor="deposit">Deposit Amount (cUSD)</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                min="1"
                placeholder="100"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isWriting || !address}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isWriting ? 'Depositing...' : 'Deposit cUSD'}
            </Button>
          </form>
        </div>

        {/* Withdraw Form */}
        <div>
          <h4 className="font-medium mb-3">Withdraw Liquidity</h4>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <Label htmlFor="withdraw">Withdraw Amount (cUSD)</Label>
              <Input
                id="withdraw"
                type="number"
                step="0.01"
                min="1"
                max={userLiquidityValue ? formatEther(userLiquidityValue) : '0'}
                placeholder="50"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isWriting || !address}
              variant="outline"
              className="w-full"
            >
              {isWriting ? 'Withdrawing...' : 'Withdraw cUSD'}
            </Button>
          </form>
        </div>

        {!address && (
          <div className="text-center text-sm text-orange-600">
            Please connect your wallet to manage liquidity
          </div>
        )}
      </CardContent>
    </Card>
  )
}
