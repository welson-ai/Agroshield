'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDemoData } from '@/hooks'
import { BarChart3, TrendingUp, Map, Calendar, DollarSign, Droplets } from 'lucide-react'

export function DemoStatistics() {
  const { 
    demoPolicies, 
    getActivePolicies,
    getTotalCoverage,
    getTotalPremiums,
    regions 
  } = useDemoData()

  const activePolicies = getActivePolicies()
  const totalCoverage = getTotalCoverage()
  const totalPremiums = getTotalPremiums()

  // Calculate additional statistics
  const avgCoverage = demoPolicies.length > 0 ? totalCoverage / demoPolicies.length : 0
  const avgPremium = demoPolicies.length > 0 ? totalPremiums / demoPolicies.length : 0
  
  const cropDistribution = demoPolicies.reduce((acc, policy) => {
    acc[policy.cropType] = (acc[policy.cropType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const regionDistribution = demoPolicies.reduce((acc, policy) => {
    acc[policy.location.region] = (acc[policy.location.region] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const avgRainfallThreshold = demoPolicies.length > 0 
    ? demoPolicies.reduce((sum, policy) => sum + parseFloat(policy.rainfallThreshold), 0) / demoPolicies.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold">{demoPolicies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold">{activePolicies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Total Coverage</p>
                <p className="text-lg font-bold">{totalCoverage.toLocaleString()} cUSD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Premiums</p>
                <p className="text-lg font-bold">{totalPremiums.toLocaleString()} cUSD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Averages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Coverage</span>
              <span className="font-bold">{avgCoverage.toFixed(0)} cUSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Premium</span>
              <span className="font-bold">{avgPremium.toFixed(0)} cUSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Threshold</span>
              <span className="font-bold">{avgRainfallThreshold.toFixed(1)} mm</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="h-5 w-5" />
              Crop Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(cropDistribution).map(([crop, count]) => (
              <div key={crop} className="flex justify-between items-center">
                <span className="text-sm">{crop}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="h-5 w-5" />
              Region Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(regionDistribution).map(([region, count]) => (
              <div key={region} className="flex justify-between items-center">
                <span className="text-sm">{region}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Coverage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Coverage Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Coverage by Crop Type</h4>
              <div className="space-y-2">
                {Object.entries(cropDistribution).map(([crop, count]) => {
                  const cropPolicies = demoPolicies.filter(p => p.cropType === crop)
                  const totalCropCoverage = cropPolicies.reduce((sum, p) => sum + parseFloat(p.coverageAmount), 0)
                  
                  return (
                    <div key={crop} className="flex justify-between items-center">
                      <span className="text-sm">{crop}</span>
                      <span className="font-bold">{totalCropCoverage.toLocaleString()} cUSD</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Risk Analysis</h4>
              <div className="space-y-2">
                {demoPolicies.map(policy => (
                  <div key={policy.id} className="flex justify-between items-center text-sm">
                    <span>{policy.cropType} - {policy.location.name}</span>
                    <span className={`font-bold ${
                      parseFloat(policy.rainfallThreshold) < 70 ? 'text-red-600' : 
                      parseFloat(policy.rainfallThreshold) < 100 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {policy.rainfallThreshold}mm
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
