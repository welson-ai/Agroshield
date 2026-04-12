'use client'

import { Navbar } from '@/components/navbar'
import { PoolStats } from '@/components/pool-stats'
import { UserPosition } from '@/components/user-position'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgroShieldPool } from '@/hooks'
import { useAccount } from 'wagmi'

export default function Pool() {
  const { address } = useAccount()
  const { totalLiquidity, isLoadingRead, readError } = useAgroShieldPool()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Liquidity Pool</h1>
          <p className="text-gray-600">Provide liquidity to earn yield and support farmers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Position */}
            <UserPosition />
            
            {/* Pool Information */}
            <Card>
              <CardHeader>
                <CardTitle>Pool Information</CardTitle>
                <CardDescription>
                  Learn about providing liquidity to AgroShield
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-800 text-sm">
                    <div className="font-medium mb-2">💰 Why Provide Liquidity?</div>
                    <div className="space-y-2">
                      <div>• Earn passive yield from insurance premiums</div>
                      <div>• Support farmers with crop insurance</div>
                      <div>• Contribute to DeFi ecosystem growth</div>
                      <div>• Withdraw anytime with no lockup period</div>
                    </div>
                  </div>
                </div>

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
                    <span className="font-mono text-xs break-all">0x369b...5d21</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-gray-700">
                    <div className="font-medium mb-1">⚙️ Pool Configuration</div>
                    <div className="space-y-1 text-xs">
                      <div>• Reserve Ratio: 10%</div>
                      <div>• Base Premium Rate: 5%</div>
                      <div>• Asset: cUSD Token</div>
                      <div>• Chain: Celo (42220)</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <a 
                    href="https://celoscan.io/address/0x369b50a492e9de0e4989910bd3594aebd89b5d21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View on CeloScan →
                  </a>
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
                      totalLiquidity && totalLiquidity > 0n ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm">
                      {totalLiquidity && totalLiquidity > 0n ? 'Pool Active' : 'Pool Empty'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Oracle Connected</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Policy Contract Ready</span>
                  </div>
                </div>

                {!address && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-orange-800 text-sm text-center">
                      <div className="font-medium mb-1">🔌 Connect Required</div>
                      <div>Connect your wallet to provide liquidity</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
