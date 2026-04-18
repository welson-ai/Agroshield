'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDynamicPremiums, type PremiumCalculation, type RiskFactor, type CropRiskProfile } from '@/hooks/useDynamicPremiums'
import { formatEther } from 'viem'
import { Calculator, TrendingUp, AlertTriangle, MapPin, Leaf } from 'lucide-react'

const DEFAULT_LOCATIONS = [
  { id: '1.0152,35.0069', name: 'Kitale, Trans-Nzoia' },
  { id: '0.4236,37.0643', name: 'Nyeri, Nyeri County' },
  { id: '-0.3684,35.2850', name: 'Kericho, Kericho County' },
  { id: '-0.7484,37.3544', name: 'Mwea, Kirinyaga County' },
  { id: '-1.0781,35.5695', name: 'Narok, Narok County' }
]

const DEFAULT_CROPS = [
  { id: 'Maize', name: 'Maize' },
  { id: 'Coffee', name: 'Coffee' },
  { id: 'Tea', name: 'Tea' },
  { id: 'Rice', name: 'Rice' },
  { id: 'Wheat', name: 'Wheat' }
]

export function PremiumCalculator() {
  const { 
    calculateDynamicPremium,
    getLocationRiskFactor,
    getCropRiskProfile,
    activeLocations,
    activeCrops 
  } = useDynamicPremiums()

  const [calculation, setCalculation] = useState<PremiumCalculation | null>(null)
  const [locationRisk, setLocationRisk] = useState<RiskFactor | null>(null)
  const [cropRisk, setCropRisk] = useState<CropRiskProfile | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const [form, setForm] = useState({
    coverageAmount: '1000',
    location: '',
    cropType: '',
    measurementPeriod: '90',
    rainfallThreshold: '80'
  })

  const handleCalculate = async () => {
    if (!form.coverageAmount || !form.location || !form.cropType) {
      return
    }

    setIsCalculating(true)
    try {
      const result = await calculateDynamicPremium(
        form.coverageAmount,
        form.location,
        form.cropType,
        Number(form.measurementPeriod),
        Number(form.rainfallThreshold)
      )
      
      if (result) {
        setCalculation(result)
      }

      // Load risk factors
      const locRisk = await getLocationRiskFactor(form.location)
      if (locRisk) {
        setLocationRisk(locRisk)
      }

      const cropProfile = await getCropRiskProfile(form.cropType)
      if (cropProfile) {
        setCropRisk(cropProfile)
      }
    } catch (error) {
      console.error('Failed to calculate premium:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const formatPrice = (price: bigint) => {
    return `${parseFloat(formatEther(price)).toFixed(2)} cUSD`
  }

  const formatPercentage = (basisPoints: bigint) => {
    return `${(Number(basisPoints) / 100).toFixed(2)}%`
  }

  const getRiskLevel = (riskScore: bigint) => {
    const score = Number(riskScore)
    if (score < 3000) return { level: 'Low', color: 'bg-green-500' }
    if (score < 5000) return { level: 'Medium', color: 'bg-yellow-500' }
    if (score < 7000) return { level: 'High', color: 'bg-orange-500' }
    return { level: 'Very High', color: 'bg-red-500' }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Dynamic Premium Calculator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Parameters</CardTitle>
            <CardDescription>
              Enter your policy details to calculate dynamic premium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coverage">Coverage Amount (cUSD)</Label>
              <Input
                id="coverage"
                type="number"
                placeholder="1000"
                value={form.coverageAmount}
                onChange={(e) => setForm(prev => ({ ...prev, coverageAmount: e.target.value }))}
              />
            </div>

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
              <Label htmlFor="crop">Crop Type</Label>
              <Select value={form.cropType} onValueChange={(value) => setForm(prev => ({ ...prev, cropType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_CROPS.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        {crop.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="threshold">Rainfall Threshold (mm)</Label>
                <Input
                  id="threshold"
                  type="number"
                  placeholder="80"
                  value={form.rainfallThreshold}
                  onChange={(e) => setForm(prev => ({ ...prev, rainfallThreshold: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={handleCalculate} 
              className="w-full"
              disabled={isCalculating || !form.coverageAmount || !form.location || !form.cropType}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Premium'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Premium Breakdown</CardTitle>
            <CardDescription>
              Dynamic premium calculation with risk factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculation ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(calculation.finalPremium)}
                  </div>
                  <div className="text-muted-foreground">Final Premium</div>
                </div>

                <Tabs defaultValue="breakdown" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    <TabsTrigger value="factors">Risk Factors</TabsTrigger>
                  </TabsList>

                  <TabsContent value="breakdown" className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base Premium:</span>
                      <span>{formatPrice(calculation.basePremium)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Adjustment:</span>
                      <span className={calculation.riskAdjustment > 0n ? 'text-red-600' : 'text-green-600'}>
                        {calculation.riskAdjustment > 0n ? '+' : ''}{formatPrice(calculation.riskAdjustment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location Factor:</span>
                      <span>{formatPercentage(calculation.locationFactor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crop Factor:</span>
                      <span>{formatPercentage(calculation.cropFactor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seasonal Factor:</span>
                      <span>{formatPercentage(calculation.seasonalFactor)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Final Premium:</span>
                      <span>{formatPrice(calculation.finalPremium)}</span>
                    </div>
                  </TabsContent>

                  <TabsContent value="factors" className="space-y-4">
                    {locationRisk && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="font-semibold">Location Risk</span>
                          <Badge className={getRiskLevel(locationRisk.baseRiskScore).color}>
                            {getRiskLevel(locationRisk.baseRiskScore).level}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Rainfall Variance: {formatPercentage(locationRisk.historicalRainfallVariance)}</div>
                          <div>Drought Frequency: {formatPercentage(locationRisk.droughtFrequency)}</div>
                          <div>Flood Frequency: {formatPercentage(locationRisk.floodFrequency)}</div>
                        </div>
                      </div>
                    )}

                    {cropRisk && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4" />
                          <span className="font-semibold">Crop Risk Profile</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Risk Multiplier: {formatPercentage(cropRisk.riskMultiplier)}</div>
                          <div>Base Premium Rate: {formatPercentage(cropRisk.basePremiumRate)}</div>
                          <div>Sensitivity Factor: {formatPercentage(cropRisk.sensitivityFactor)}</div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter policy parameters and click calculate to see premium breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Comparison */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Premium Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatPrice(calculation.basePremium)}</div>
                <div className="text-sm text-muted-foreground">Standard Premium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatPrice(calculation.riskAdjustment)}
                </div>
                <div className="text-sm text-muted-foreground">Risk Adjustment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatPrice(calculation.finalPremium)}</div>
                <div className="text-sm text-muted-foreground">Dynamic Premium</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
