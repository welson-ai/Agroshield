'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DemoPolicyCard } from '@/components/demo-policy-card'
import { PolicySeeder } from '@/components/policy-seeder'
import { useDemoData } from '@/hooks'
import { BarChart3, MapPin, DollarSign, Users, RefreshCw, Filter } from 'lucide-react'

export function DemoDashboard() {
  const [selectedCrop, setSelectedCrop] = useState<string>('all')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [showFullDetails, setShowFullDetails] = useState(false)
  
  const { 
    demoPolicies, 
    isLoading, 
    error, 
    loadDemoData,
    getPoliciesByCrop,
    getPoliciesByRegion,
    getActivePolicies,
    getTotalCoverage,
    getTotalPremiums,
    regions
  } = useDemoData()

  const filteredPolicies = demoPolicies.filter(policy => {
    const cropMatch = selectedCrop === 'all' || policy.cropType === selectedCrop
    const regionMatch = selectedRegion === 'all' || policy.location.region.includes(selectedRegion)
    return cropMatch && regionMatch
  })

  const activePolicies = getActivePolicies()
  const totalCoverage = getTotalCoverage()
  const totalPremiums = getTotalPremiums()

  const cropTypes = ['all', ...Array.from(new Set(demoPolicies.map(p => p.cropType)))]
  const regionList = ['all', ...Array.from(new Set(demoPolicies.map(p => p.location.region)))]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading demo data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadDemoData}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Users className="h-5 w-5 text-green-600" />
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
                <p className="text-2xl font-bold">{totalCoverage.toLocaleString()} cUSD</p>
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
                <p className="text-2xl font-bold">{totalPremiums.toLocaleString()} cUSD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Demo Policies
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullDetails(!showFullDetails)}
              >
                {showFullDetails ? 'Simple View' : 'Full Details'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDemoData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium">Crop Type</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="ml-2 px-3 py-1 border rounded-md"
              >
                {cropTypes.map(crop => (
                  <option key={crop} value={crop}>
                    {crop === 'all' ? 'All Crops' : crop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="ml-2 px-3 py-1 border rounded-md"
              >
                {regionList.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Showing {filteredPolicies.length} of {demoPolicies.length} policies</span>
          </div>
        </CardContent>
      </Card>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolicies.map(policy => (
          <DemoPolicyCard
            key={policy.id}
            policy={policy}
            showFullDetails={showFullDetails}
          />
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No policies found matching the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
