'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { WalletInfo } from '@/components/wallet-info'
import { CreatePolicyForm } from '@/components/create-policy-form'
import { PolicyCard } from '@/components/policy-card'
import { WeatherDisplay } from '@/components/weather-display'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgroShieldPolicy } from '@/hooks'
import { useAccount } from 'wagmi'

export default function Dashboard() {
  const { address } = useAccount()
  const { userPolicies, activePoliciesCount, payPremium, isWriting } = useAgroShieldPolicy()
  const [activeTab, setActiveTab] = useState<'policies' | 'weather'>('policies')

  const handlePayPremium = async (policyId: number) => {
    try {
      await payPremium(policyId)
    } catch (error) {
      console.error('Premium payment failed:', error)
      alert('Premium payment failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
          <p className="text-gray-600">Manage your crop insurance policies</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Policy Form */}
            <CreatePolicyForm />

            {/* Tab Navigation */}
            <Card>
              <CardHeader>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('policies')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'policies' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Your Policies ({activePoliciesCount || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('weather')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'weather' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Weather Data
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activeTab === 'policies' && (
                  <div className="space-y-4">
                    {userPolicies && userPolicies.length > 0 ? (
                      userPolicies.map((policy, index) => (
                        <PolicyCard
                          key={index}
                          policy={policy}
                          onPayPremium={handlePayPremium}
                          isLoading={isWriting}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="mb-4">🌾</div>
                        <p>No policies found</p>
                        <p className="text-sm">Create your first policy above</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'weather' && (
                  <div className="p-4">
                    <WeatherDisplay />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WalletInfo />
            
            <Card>
              <CardHeader>
                <CardTitle>Policy Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Policies</span>
                  <span className="font-semibold">{activePoliciesCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Coverage</span>
                  <span className="font-semibold">
                    {userPolicies ? 
                      userPolicies.reduce((sum, policy) => 
                        sum + Number(policy.coverageAmount), 0n
                      ).toString() : '0'} cUSD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Premiums</span>
                  <span className="font-semibold">
                    {userPolicies ? 
                      userPolicies.reduce((sum, policy) => 
                        sum + Number(policy.premiumAmount), 0n
                      ).toString() : '0'} cUSD
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>All systems operational</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Oracle data current</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-600">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span>3 policies near expiry</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">1.</span>
                  <p>Select crop type and coverage amount</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">2.</span>
                  <p>Set rainfall threshold for protection</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">3.</span>
                  <p>Pay premium in cUSD tokens</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">4.</span>
                  <p>Automatic payout if conditions met</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
