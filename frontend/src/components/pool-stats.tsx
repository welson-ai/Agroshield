'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgroShieldPool } from '@/hooks'
import { formatEther } from 'viem'

export function PoolStats() {
  const { totalLiquidity, reserveRatio, isLoadingRead, readError } = useAgroShieldPool()

  if (isLoadingRead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading pool data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (readError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <div className="mb-4">⚠️</div>
            <p>Failed to load pool data</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const availableLiquidity = totalLiquidity && typeof totalLiquidity === 'bigint' ? 
    (totalLiquidity * BigInt(9000)) / BigInt(10000) : BigInt(0) // 90% available after 10% reserve
  const utilization = totalLiquidity && typeof totalLiquidity === 'bigint' && totalLiquidity > BigInt(0) ? 
    Number((totalLiquidity - availableLiquidity) * BigInt(100) / totalLiquidity) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool Statistics</CardTitle>
        <CardDescription>
          Real-time liquidity pool metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-sm text-gray-600">Total Liquidity</div>
            <div className="text-xl font-bold text-blue-600">
              {totalLiquidity && typeof totalLiquidity === 'bigint' ? formatEther(totalLiquidity) : '0.0000'} cUSD
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">💧</div>
            <div className="text-sm text-gray-600">Available Liquidity</div>
            <div className="text-xl font-bold text-green-600">
              {availableLiquidity && typeof availableLiquidity === 'bigint' ? formatEther(availableLiquidity) : '0.0000'} cUSD
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-sm text-gray-600">Reserve Ratio</div>
            <div className="text-xl font-bold text-purple-600">
              {reserveRatio ? `${Number(reserveRatio) / 100}%` : '10%'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-sm text-gray-600">Utilization</div>
            <div className="text-xl font-bold text-orange-600">
              {utilization.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>🏊 Pool Status:</span>
              <span className="font-medium text-green-600">
                {totalLiquidity && typeof totalLiquidity === 'bigint' && totalLiquidity > BigInt(0) ? 'Active' : 'Empty'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>🛡️ Reserve Fund:</span>
              <span className="font-medium">
                {totalLiquidity && typeof totalLiquidity === 'bigint' && typeof availableLiquidity === 'bigint' ? formatEther(totalLiquidity - availableLiquidity) : '0.0000'} cUSD
              </span>
            </div>
            <div className="flex justify-between">
              <span>👥 Providers:</span>
              <span className="font-medium">Multiple</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-blue-800 text-sm">
            <div className="font-medium mb-1">💡 How Liquidity Works</div>
            <div className="space-y-1">
              <div>• 10% reserved for claim payouts</div>
              <div>• 90% available for insurance coverage</div>
              <div>• Earn yield from insurance premiums</div>
              <div>• Withdraw anytime with earnings</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
