'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAgroShieldPolicy } from '@/hooks'
import { useAccount } from 'wagmi'

const CROP_TYPES = [
  { id: 1, name: 'Wheat', icon: '🌾', riskMultiplier: 1.0 },
  { id: 2, name: 'Corn', icon: '🌽', riskMultiplier: 1.2 },
  { id: 3, name: 'Rice', icon: '🌾', riskMultiplier: 1.1 },
  { id: 4, name: 'Soybeans', icon: '🫘', riskMultiplier: 0.9 },
  { id: 5, name: 'Barley', icon: '🌾', riskMultiplier: 1.0 },
]

export function CreatePolicyForm() {
  const { address } = useAccount()
  const { createPolicy, isWriting, confirmationReceipt } = useAgroShieldPolicy()
  
  const [formData, setFormData] = useState({
    cropType: '1',
    coverageAmount: '',
    rainfallThreshold: '',
    measurementPeriod: '30',
    location: '1001'
  })

  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    try {
      await createPolicy(
        formData.coverageAmount,
        formData.rainfallThreshold,
        formData.measurementPeriod,
        formData.location
      )
      setShowSuccess(true)
      
      // Reset form after successful creation
      setTimeout(() => {
        setFormData({
          cropType: '1',
          coverageAmount: '',
          rainfallThreshold: '',
          measurementPeriod: '30',
          location: '1001'
        })
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Policy creation failed:', error)
      alert('Policy creation failed. Please try again.')
    }
  }

  const selectedCrop = CROP_TYPES.find(crop => crop.id === parseInt(formData.cropType))
  const estimatedPremium = formData.coverageAmount ? 
    (parseFloat(formData.coverageAmount) * 0.05 * (selectedCrop?.riskMultiplier || 1.0)).toFixed(2) : '0.00'

  if (showSuccess && confirmationReceipt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">✅ Policy Created Successfully!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-lg font-medium">
              Your insurance policy has been created
            </div>
            <div className="text-sm text-gray-600">
              Transaction Hash: {confirmationReceipt.transactionHash?.slice(0, 10)}...
            </div>
            <Button 
              onClick={() => setShowSuccess(false)}
              className="mt-4"
              variant="outline"
            >
              Create Another Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show transaction progress
  if (isWriting) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="text-center py-8">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🔄</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-medium text-blue-800">
              Creating your insurance policy...
            </div>
            <div className="text-sm text-blue-600">
              Please confirm the transaction in your wallet
            </div>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Insurance Policy</CardTitle>
        <CardDescription>
          Protect your crops with parametric weather-based insurance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crop Type Selection */}
          <div>
            <Label htmlFor="cropType">Crop Type</Label>
            <select
              id="cropType"
              value={formData.cropType}
              onChange={(e) => setFormData({...formData, cropType: e.target.value})}
              className="w-full p-2 border rounded-md bg-white"
            >
              {CROP_TYPES.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.icon} {crop.name} (Risk: {crop.riskMultiplier}x)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coverageAmount">Coverage Amount (cUSD)</Label>
              <Input
                id="coverageAmount"
                type="number"
                step="0.01"
                min="100"
                placeholder="1000"
                value={formData.coverageAmount}
                onChange={(e) => setFormData({...formData, coverageAmount: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="rainfallThreshold">Rainfall Threshold (mm)</Label>
              <Input
                id="rainfallThreshold"
                type="number"
                step="0.1"
                min="10"
                max="500"
                placeholder="50"
                value={formData.rainfallThreshold}
                onChange={(e) => setFormData({...formData, rainfallThreshold: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="measurementPeriod">Measurement Period (days)</Label>
              <select
                id="measurementPeriod"
                value={formData.measurementPeriod}
                onChange={(e) => setFormData({...formData, measurementPeriod: e.target.value})}
                className="w-full p-2 border rounded-md bg-white"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="location">Location ID</Label>
              <Input
                id="location"
                type="number"
                placeholder="1001"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Premium Estimate */}
          {formData.coverageAmount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-2">💰 Premium Estimate</div>
                <div className="text-lg font-bold">
                  Estimated Premium: {estimatedPremium} cUSD
                </div>
                <div className="text-xs mt-1">
                  Based on {selectedCrop?.name} with {selectedCrop?.riskMultiplier}x risk multiplier
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isWriting || !address}
            className="w-full bg-green-600 hover:bg-green-700 relative"
          >
            {isWriting && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              </div>
            )}
            <span className={isWriting ? 'opacity-0' : ''}>
              {isWriting ? 'Creating Policy...' : 'Create Policy'}
            </span>
          </Button>

          {!address && (
            <div className="text-center text-sm text-orange-600">
              Please connect your wallet to create a policy
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
