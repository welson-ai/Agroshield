'use client'

import { useState } from 'react'
import { WalletInfo } from '@/components/wallet-info'
import { CreatePolicyForm } from '@/components/create-policy-form'
import { PolicyCard } from '@/components/policy-card'
import { WeatherDisplay } from '@/components/weather-display'
import { WeatherDisplayNew } from '@/components/weather-display-new'
import { LocationInput } from '@/components/location-input'
import { DemoDashboard } from '@/components/demo-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgroShieldPolicy } from '@/hooks'

/**
 * FarmerDashboard component - Main dashboard for farmers to manage insurance policies
 * Provides policy creation, management, and weather monitoring capabilities
 * 
 * @returns JSX.Element - Comprehensive farmer dashboard with policy management
 * 
 * @example
 * <FarmerDashboard />
 */
export function FarmerDashboard() {
  const { userPolicies, activePoliciesCount, payPremium, isWriting } = useAgroShieldPolicy()
  const [activeTab, setActiveTab] = useState<'policies' | 'weather' | 'demo'>('policies')
  const [location, setLocation] = useState({ lat: 6.5244, lon: 3.3792 }) // Nairobi coordinates

  const handlePayPremium = async (policyId: number) => {
    try {
      await payPremium(policyId)
    } catch (error) {
      console.error('Failed to pay premium:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
          <p className="text-gray-600">Manage your crop insurance policies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Policy Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Policy</CardTitle>
                <CardDescription>
                  Protect your crops with parametric insurance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreatePolicyForm />
              </CardContent>
            </Card>

            {/* Policies and Weather Tabs */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <button
                    onClick={() => setActiveTab('policies')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      activeTab === 'policies' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Your Policies ({Number(activePoliciesCount) || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('weather')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      activeTab === 'weather' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Weather Data
                  </button>
                  <button
                    onClick={() => setActiveTab('demo')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      activeTab === 'demo' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Demo Data
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activeTab === 'policies' && (
                  <div className="space-y-4">
                    {userPolicies && Array.isArray(userPolicies) && userPolicies.length > 0 ? (
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
                  <div className="space-y-4">
                    <LocationInput 
                      onLocationChange={(lat, lon) => setLocation({ lat, lon })}
                      currentLat={location.lat}
                      currentLon={location.lon}
                    />
                    <WeatherDisplayNew 
                      lat={location.lat}
                      lon={location.lon}
                      policyThreshold={50} // Example: 50mm threshold
                    />
                  </div>
                )}
                
                {activeTab === 'demo' && (
                  <div className="p-4">
                    <DemoDashboard />
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
                  <span className="font-semibold">{Number(activePoliciesCount) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Coverage</span>
                  <span className="font-semibold">
                    {userPolicies && Array.isArray(userPolicies) ? 
                      userPolicies.reduce((sum, policy) => 
                        sum + Number(policy.coverageAmount), BigInt(0)
                      ).toString() : '0'} cUSD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Premiums</span>
                  <span className="font-semibold">
                    {userPolicies && Array.isArray(userPolicies) ? 
                      userPolicies.reduce((sum, policy) => 
                        sum + Number(policy.premiumAmount), BigInt(0)
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
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Create New Policy
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Weather Data
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Policy History
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
