'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DemoPolicy } from '@/data/demo-policies'
import { MapPin, Calendar, DollarSign, Droplets, User } from 'lucide-react'

interface DemoPolicyCardProps {
  policy: DemoPolicy
  showFullDetails?: boolean
}

export function DemoPolicyCard({ policy, showFullDetails = false }: DemoPolicyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'claimed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCropIcon = (cropType: string) => {
    const icons: Record<string, string> = {
      'Maize': ' maize-icon',
      'Coffee': ' coffee-icon',
      'Tea': ' tea-icon',
      'Rice': ' rice-icon',
      'Wheat': ' wheat-icon'
    }
    return icons[cropType] || ' crop-icon'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">{getCropIcon(policy.cropType)}</span>
            {policy.cropType} Policy
          </CardTitle>
          <Badge className={getStatusColor(policy.status)}>
            {policy.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Farmer Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{policy.farmer.name}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{policy.location.name}, {policy.location.region}</span>
        </div>

        {/* Coverage Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Coverage</span>
          </div>
          <span className="font-bold text-green-600">
            {parseFloat(policy.coverageAmount).toLocaleString()} cUSD
          </span>
        </div>

        {/* Rainfall Threshold */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Threshold</span>
          </div>
          <span className="font-bold text-blue-600">
            {policy.rainfallThreshold}mm
          </span>
        </div>

        {/* Premium */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Premium</span>
          <span className="font-bold text-orange-600">
            {parseFloat(policy.premium).toLocaleString()} cUSD
          </span>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{policy.measurementPeriod} days</span>
        </div>

        {/* Additional Details */}
        {showFullDetails && (
          <div className="border-t pt-3 space-y-2">
            <div className="text-xs text-gray-600">
              <div>Created: {policy.createdAt.toLocaleDateString()}</div>
              <div>Expires: {policy.expiresAt.toLocaleDateString()}</div>
              <div>Wallet: {policy.farmer.wallet.slice(0, 8)}...{policy.farmer.wallet.slice(-6)}</div>
            </div>
            <div className="text-xs text-gray-600">
              <div>Coordinates: {policy.location.lat.toFixed(4)}, {policy.location.lon.toFixed(4)}</div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full"
            style={{ width: '75%' }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 text-center">
          Policy Duration: 75% complete
        </p>
      </CardContent>
    </Card>
  )
}
