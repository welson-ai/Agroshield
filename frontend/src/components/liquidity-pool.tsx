'use client'

import { Navbar } from '@/components/navbar'
import { PoolStats } from '@/components/pool-stats'
import { UserPosition } from '@/components/user-position'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgroShieldPool } from '@/hooks'

export function LiquidityPool() {
  const { totalLiquidity } = useAgroShieldPool()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Liquidity Pool</h1>
          <p className="text-gray-600">Provide liquidity to earn yield from insurance premiums</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Position */}
            <UserPosition />
            
            {/* Educational Content */}
            <Card>
              <CardHeader>
                <CardTitle>About Liquidity Provision</CardTitle>
                <CardDescription>
                  Learn how providing liquidity helps farmers and earns you yield
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 text-sm">
                    <div className="font-medium mb-2">🛡️ Risk Management</div>
                    <div className="space-y-2">
                      <div>• 10% reserve fund for claim payouts</div>
                      <div>• Diversified across multiple policies</div>
                      <div>• Weather-based triggers reduce fraud</div>
                      <div>• Transparent on-chain execution</div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-purple-800 text-sm">
                    <div className="font-medium mb-2">📊 Yield Potential</div>
                    <div className="space-y-2">
                      <div>• Earn from insurance premiums</div>
                      <div>• Profit from successful underwriting</div>
                      <div>• Compound earnings with reinvestment</div>
                      <div>• Competitive APY rates</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pool Statistics */}
            <PoolStats />
            
            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contract:</span>
                    <span className="font-mono text-xs">AgroShieldPool</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <span>Celo Mainnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-mono text-xs">0x369b...5d21</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reserve Ratio:</span>
                    <span>10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token:</span>
                    <span>cUSD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chain ID:</span>
                    <span>42220</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Pool Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      totalLiquidity && typeof totalLiquidity === 'bigint' && totalLiquidity > BigInt(0) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">
                      {totalLiquidity && typeof totalLiquidity === 'bigint' && totalLiquidity > BigInt(0) ? 'Pool Active' : 'Pool Empty'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Oracle Connected</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Policy Contract Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Add Liquidity
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Withdraw Liquidity
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  View Pool History
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
