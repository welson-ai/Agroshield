'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Pool() {
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Liquidity Pool</h1>
          <p className="text-gray-600">Provide liquidity to earn yield and support farmers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pool Operations */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Provide Liquidity</CardTitle>
                <CardDescription>
                  Deposit cUSD to earn yield from insurance premiums
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deposit">Deposit Amount (cUSD)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Deposit cUSD
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdraw Liquidity</CardTitle>
                <CardDescription>
                  Withdraw your liquidity and earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="withdraw">Withdraw Amount (cUSD)</Label>
                  <Input
                    id="withdraw"
                    type="number"
                    placeholder="50"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <Button className="w-full" variant="outline">
                  Withdraw cUSD
                </Button>
              </CardContent>
            </Card>

            {/* Your Position */}
            <Card>
              <CardHeader>
                <CardTitle>Your Position</CardTitle>
                <CardDescription>
                  Your current liquidity position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-4">💰</div>
                  <p>No liquidity provided</p>
                  <p className="text-sm">Deposit cUSD to start earning</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pool Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pool Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Liquidity</span>
                  <span className="font-semibold">0 cUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Liquidity</span>
                  <span className="font-semibold">0 cUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">APY</span>
                  <span className="font-semibold text-green-600">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Providers</span>
                  <span className="font-semibold">0</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Coverage</span>
                  <span className="font-semibold">0 cUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reserve Ratio</span>
                  <span className="font-semibold">10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-semibold">0%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How Liquidity Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">1.</span>
                  <p>Deposit cUSD tokens into the pool</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">2.</span>
                  <p>Receive liquidity provider shares</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">3.</span>
                  <p>Earn yield from insurance premiums</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">4.</span>
                  <p>Withdraw anytime with earnings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
