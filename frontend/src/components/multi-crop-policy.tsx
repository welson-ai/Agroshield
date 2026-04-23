'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMultiCropPolicy, type CropEntry, type MultiCropPolicyData, type PolicySummary } from '@/hooks/useMultiCropPolicy'
import { formatEther } from 'viem'
import { Plus, Trash2, Calculator, Leaf, MapPin, Calendar, DollarSign } from 'lucide-react'

const DEFAULT_LOCATIONS = [
  { id: '1.0152,35.0069', name: 'Kitale, Trans-Nzoia' },
  { id: '0.4236,37.0643', name: 'Nyeri, Nyeri County' },
  { id: '-0.3684,35.2850', name: 'Kericho, Kericho County' }
]

const DEFAULT_CROPS = [
  { id: 'Maize', name: 'Maize' },
  { id: 'Coffee', name: 'Coffee' },
  { id: 'Tea', name: 'Tea' },
  { id: 'Rice', name: 'Rice' },
  { id: 'Wheat', name: 'Wheat' }
]

/**
 * MultiCropPolicy component - Interface for creating and managing multi-crop insurance policies
 * Allows farmers to bundle multiple crops under a single insurance policy
 * 
 * @returns JSX.Element - Multi-crop policy management interface with bundling features
 * 
 * @example
 * <MultiCropPolicy />
 */
export function MultiCropPolicy() {
  const { 
    createMultiCropPolicy,
    payMultiCropPremium,
    processAllCropPayouts,
    calculateBundlePremium,
    getFarmerMultiCropPolicies,
    getMultiCropPolicySummary,
    isWriting 
  } = useMultiCropPolicy()

  const [crops, setCrops] = useState<CropEntry[]>([
    { cropType: '', coverageAmount: '', rainfallThreshold: 80, weight: 5000 }
  ])
  const [bundlePremium, setBundlePremium] = useState<bigint | null>(null)
  const [userPolicies, setUserPolicies] = useState<MultiCropPolicyData[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<MultiCropPolicyData | null>(null)
  const [policySummary, setPolicySummary] = useState<PolicySummary | null>(null)

  const [form, setForm] = useState({
    location: '',
    measurementPeriod: '90',
    description: ''
  })

  const addCrop = () => {
    if (crops.length < 5) {
      setCrops([...crops, { cropType: '', coverageAmount: '', rainfallThreshold: 80, weight: 5000 }])
    }
  }

  const removeCrop = (index: number) => {
    if (crops.length > 1) {
      setCrops(crops.filter((_, i) => i !== index))
    }
  }

  const updateCrop = (index: number, field: keyof CropEntry, value: string | number) => {
    const updatedCrops = [...crops]
    updatedCrops[index] = { ...updatedCrops[index], [field]: value }
    setCrops(updatedCrops)
  }

  const calculateBundle = async () => {
    // Calculate bundle premium for valid crops with complete data
    const validCrops = crops.filter(crop => 
      crop.cropType && crop.coverageAmount && crop.rainfallThreshold
    )

    if (validCrops.length > 0 && form.location) {
      try {
        const premium = await calculateBundlePremium(
          validCrops,
          form.location,
          Number(form.measurementPeriod)
        )
        if (premium) {
          setBundlePremium(premium)
        }
      } catch (error) {
        console.error('Failed to calculate bundle premium:', error)
      }
    }
  }

  const handleCreatePolicy = async () => {
    const validCrops = crops.filter(crop => 
      crop.cropType && crop.coverageAmount && crop.rainfallThreshold
    )

    if (validCrops.length === 0 || !form.location || !form.description) {
      return
    }

    try {
      await createMultiCropPolicy(
        validCrops,
        form.location,
        Number(form.measurementPeriod),
        form.description
      )
      
      // Reset form
      setCrops([{ cropType: '', coverageAmount: '', rainfallThreshold: 80, weight: 5000 }])
      setForm({ location: '', measurementPeriod: '90', description: '' })
      setBundlePremium(null)
    } catch (error) {
      console.error('Failed to create multi-crop policy:', error)
    }
  }

  const loadUserPolicies = async () => {
    try {
      const policies = await getFarmerMultiCropPolicies('0x') // Replace with actual user address
      if (policies) {
        setUserPolicies(policies)
      }
    } catch (error) {
      console.error('Failed to load user policies:', error)
    }
  }

  const loadPolicySummary = async (policyId: number) => {
    try {
      const summary = await getMultiCropPolicySummary(policyId)
      if (summary) {
        setPolicySummary(summary)
      }
    } catch (error) {
      console.error('Failed to load policy summary:', error)
    }
  }

  const handlePayPremium = async (policyId: number) => {
    try {
      await payMultiCropPremium(policyId)
      loadUserPolicies()
    } catch (error) {
      console.error('Failed to pay premium:', error)
    }
  }

  const handleProcessPayouts = async (policyId: number) => {
    try {
      await processAllCropPayouts(policyId)
      loadUserPolicies()
    } catch (error) {
      console.error('Failed to process payouts:', error)
    }
  }

  useEffect(() => {
    calculateBundle()
  }, [crops, form.location, form.measurementPeriod])

  useEffect(() => {
    loadUserPolicies()
  }, [])

  const formatPrice = (price: bigint) => {
    return `${parseFloat(formatEther(price)).toFixed(2)} cUSD`
  }

  const getTotalCoverage = () => {
    return crops.reduce((total, crop) => {
      return total + (parseFloat(crop.coverageAmount) || 0)
    }, 0)
  }

  const getTotalWeight = () => {
    return crops.reduce((total, crop) => total + crop.weight, 0)
  }

  const isValidForm = () => {
    const validCrops = crops.filter(crop => 
      crop.cropType && crop.coverageAmount && crop.rainfallThreshold
    )
    return validCrops.length > 0 && form.location && form.description && getTotalWeight() === 10000
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Leaf className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Multi-Crop Insurance</h1>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Policy</TabsTrigger>
          <TabsTrigger value="my-policies">My Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* Crop Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Crop Configuration
                <Button onClick={addCrop} disabled={crops.length >= 5}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Crop
                </Button>
              </CardTitle>
              <CardDescription>
                Configure multiple crops for your insurance policy (weights must total 100%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {crops.map((crop, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Crop #{index + 1}</h4>
                    {crops.length > 1 && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => removeCrop(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Crop Type</Label>
                      <Select 
                        value={crop.cropType} 
                        onValueChange={(value) => updateCrop(index, 'cropType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_CROPS.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Coverage Amount (cUSD)</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={crop.coverageAmount}
                        onChange={(e) => updateCrop(index, 'coverageAmount', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rainfall Threshold (mm)</Label>
                      <Input
                        type="number"
                        placeholder="80"
                        value={crop.rainfallThreshold}
                        onChange={(e) => updateCrop(index, 'rainfallThreshold', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Weight (%)</Label>
                      <Input
                        type="number"
                        placeholder="50"
                        value={crop.weight / 100}
                        onChange={(e) => updateCrop(index, 'weight', parseInt(e.target.value) * 100 || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <span className="font-semibold">Total Weight: </span>
                  <span className={getTotalWeight() === 10000 ? 'text-green-600' : 'text-red-600'}>
                    {getTotalWeight() / 100}%
                  </span>
                </div>
                <div className="flex-1">
                  <span className="font-semibold">Total Coverage: </span>
                  <span>{getTotalCoverage().toFixed(2)} cUSD</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Details */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={form.location} onValueChange={(value) => setForm(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_LOCATIONS.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {location.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Measurement Period (days)</Label>
                  <Input
                    id="period"
                    type="number"
                    placeholder="90"
                    value={form.measurementPeriod}
                    onChange={(e) => setForm(prev => ({ ...prev, measurementPeriod: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe your multi-crop policy..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bundle Premium */}
          {bundlePremium && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Bundle Premium Calculation
                </CardTitle>
                <CardDescription>
                  Discount applied for multi-crop bundle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(bundlePremium)}
                  </div>
                  <div className="text-muted-foreground">Total Bundle Premium</div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={handleCreatePolicy}
            className="w-full"
            disabled={!isValidForm() || isWriting}
          >
            {isWriting ? 'Creating Policy...' : 'Create Multi-Crop Policy'}
          </Button>
        </TabsContent>

        <TabsContent value="my-policies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPolicies.map((policy) => (
              <Card key={policy.policyId.toString()} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Multi-Crop Policy #{policy.policyId.toString()}</CardTitle>
                  <CardDescription>{policy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{formatPrice(policy.totalCoverage)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{policy.measurementPeriod.toString()} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4" />
                      <span>{policy.crops.length} crops</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        onClick={() => handlePayPremium(Number(policy.policyId))}
                        disabled={policy.isPaid}
                      >
                        {policy.isPaid ? 'Paid' : 'Pay Premium'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleProcessPayouts(Number(policy.policyId))}
                        disabled={!policy.isPaid}
                      >
                        Process Payouts
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
