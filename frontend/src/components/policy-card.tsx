'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatEther } from 'viem'

interface PolicyCardProps {
  policy: {
    policyId: number
    farmer: string
    coverageAmount: bigint
    premiumAmount: bigint
    rainfallThreshold: number
    measurementPeriod: number
    startTime: number
    endTime: number
    active: boolean
    paidOut: boolean
    location: number
  }
  onPayPremium?: (policyId: number) => void
  isLoading?: boolean
}

export function PolicyCard({ policy, onPayPremium, isLoading }: PolicyCardProps) {
  const isActive = policy.active && !policy.paidOut
  const isExpired = Date.now() / 1000 > policy.endTime
  const progress = isActive ? 
    Math.min(((Date.now() / 1000 - policy.startTime) / (policy.endTime - policy.startTime)) * 100, 100) : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Policy #{policy.policyId}</CardTitle>
            <CardDescription>
              Location: {policy.location} | Period: {policy.measurementPeriod} days
            </CardDescription>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 
            policy.paidOut ? 'bg-blue-100 text-blue-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {isActive ? 'Active' : policy.paidOut ? 'Paid Out' : 'Inactive'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Coverage Amount</div>
            <div className="font-semibold">
              {formatEther(policy.coverageAmount)} cUSD
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Premium</div>
            <div className="font-semibold">
              {formatEther(policy.premiumAmount)} cUSD
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Rainfall Threshold</div>
            <div className="font-semibold">{policy.rainfallThreshold}mm</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Current Progress</div>
            <div className="font-semibold">{progress.toFixed(1)}%</div>
          </div>
        </div>

        {isActive && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Policy Period</span>
              <span>
                {new Date(policy.startTime * 1000).toLocaleDateString()} - {new Date(policy.endTime * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {policy.paidOut && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-800 font-medium text-center">
              🎉 Policy paid out successfully!
            </div>
          </div>
        )}

        {isExpired && !policy.paidOut && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-gray-800 font-medium text-center">
              ⏰ Policy expired without payout
            </div>
          </div>
        )}

        {isActive && onPayPremium && (
          <Button 
            onClick={() => onPayPremium(policy.policyId)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Pay Premium'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
