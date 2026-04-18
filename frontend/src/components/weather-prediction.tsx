'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useWeatherPrediction, type WeatherPrediction, type PredictionAccuracy, type PremiumAdjustment } from '@/hooks/useWeatherPrediction'
import { formatEther } from 'viem'
import { Cloud, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, MapPin, Calendar, BarChart3 } from 'lucide-react'

const DEFAULT_LOCATIONS = [
  { id: '1.0152,35.0069', name: 'Kitale, Trans-Nzoia' },
  { id: '0.4236,37.0643', name: 'Nyeri, Nyeri County' },
  { id: '-0.3684,35.2850', name: 'Kericho, Kericho County' }
]

const DATA_SOURCES = [
  { id: 'OpenWeather', name: 'OpenWeather API' },
  { id: 'WeatherAPI', name: 'WeatherAPI.com' },
  { id: 'AccuWeather', name: 'AccuWeather' },
  { id: 'NOAA', name: 'NOAA' }
]

export function WeatherPrediction() {
  const { 
    submitWeatherPrediction,
    validatePrediction,
    calculatePremiumWithPrediction,
    getLocationPredictions,
    getActivePredictions,
    getPredictionAccuracy,
    getPredictionStats,
    isWriting 
  } = useWeatherPrediction()

  const [predictions, setPredictions] = useState<WeatherPrediction[]>([])
  const [accuracy, setAccuracy] = useState<PredictionAccuracy | null>(null)
  const [premiumAdjustment, setPremiumAdjustment] = useState<PremiumAdjustment | null>(null)
  const [stats, setStats] = useState<any>(null)

  const [form, setForm] = useState({
    location: '',
    timestamp: '',
    predictedRainfall: '',
    confidence: '80',
    predictionPeriod: '7',
    dataSource: ''
  })

  const [validationForm, setValidationForm] = useState({
    location: '',
    predictionIndex: '0',
    actualRainfall: ''
  })

  const [premiumForm, setPremiumForm] = useState({
    coverageAmount: '1000',
    location: '',
    cropType: 'Maize',
    measurementPeriod: '90',
    rainfallThreshold: '80'
  })

  useEffect(() => {
    loadPredictions()
    loadStats()
  }, [])

  const loadPredictions = async () => {
    if (form.location) {
      try {
        const activePreds = await getActivePredictions(form.location)
        if (activePreds) {
          setPredictions(activePreds)
        }
      } catch (error) {
        console.error('Failed to load predictions:', error)
      }
    }
  }

  const loadAccuracy = async () => {
    if (form.location) {
      try {
        const acc = await getPredictionAccuracy(form.location)
        if (acc) {
          setAccuracy(acc)
        }
      } catch (error) {
        console.error('Failed to load accuracy:', error)
      }
    }
  }

  const loadStats = async () => {
    try {
      const predictionStats = await getPredictionStats()
      if (predictionStats) {
        setStats(predictionStats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSubmitPrediction = async () => {
    if (!form.location || !form.predictedRainfall || !form.dataSource) {
      return
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000) + (Number(form.predictionPeriod) * 24 * 60 * 60)
      
      await submitWeatherPrediction(
        form.location,
        timestamp,
        Number(form.predictedRainfall),
        Number(form.confidence),
        Number(form.predictionPeriod),
        form.dataSource
      )
      
      // Reset form
      setForm({
        location: '',
        timestamp: '',
        predictedRainfall: '',
        confidence: '80',
        predictionPeriod: '7',
        dataSource: ''
      })
      
      loadPredictions()
    } catch (error) {
      console.error('Failed to submit prediction:', error)
    }
  }

  const handleValidatePrediction = async () => {
    if (!validationForm.location || !validationForm.actualRainfall) {
      return
    }

    try {
      await validatePrediction(
        validationForm.location,
        Number(validationForm.predictionIndex),
        Number(validationForm.actualRainfall)
      )
      
      loadAccuracy()
      loadPredictions()
      
      setValidationForm({
        location: '',
        predictionIndex: '0',
        actualRainfall: ''
      })
    } catch (error) {
      console.error('Failed to validate prediction:', error)
    }
  }

  const handleCalculatePremium = async () => {
    if (!premiumForm.coverageAmount || !premiumForm.location) {
      return
    }

    try {
      const adjustment = await calculatePremiumWithPrediction(
        premiumForm.coverageAmount,
        premiumForm.location,
        premiumForm.cropType,
        Number(premiumForm.measurementPeriod),
        Number(premiumForm.rainfallThreshold)
      )
      
      if (adjustment) {
        setPremiumAdjustment(adjustment)
      }
    } catch (error) {
      console.error('Failed to calculate premium:', error)
    }
  }

  const formatPrice = (price: bigint) => {
    return `${parseFloat(formatEther(price)).toFixed(2)} cUSD`
  }

  const formatPercentage = (basisPoints: bigint) => {
    return `${(Number(basisPoints) / 100).toFixed(2)}%`
  }

  const getConfidenceColor = (confidence: bigint) => {
    const conf = Number(confidence)
    if (conf >= 8000) return 'bg-green-500'
    if (conf >= 6000) return 'bg-yellow-500'
    if (conf >= 4000) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 60) return 'text-yellow-600'
    if (accuracy >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Cloud className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Weather Prediction Dashboard</h1>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPredictions.toString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePredictions.toString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getAccuracyColor(Number(stats.averageAccuracy))}`}>
                {formatPercentage(stats.averageAccuracy)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Locations Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.locationsCovered.toString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="submit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submit">Submit Prediction</TabsTrigger>
          <TabsTrigger value="validate">Validate Prediction</TabsTrigger>
          <TabsTrigger value="premium">Premium Impact</TabsTrigger>
          <TabsTrigger value="predictions">Active Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Weather Prediction</CardTitle>
              <CardDescription>
                Submit a new weather prediction for premium adjustment
              </CardDescription>
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
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Select value={form.dataSource} onValueChange={(value) => setForm(prev => ({ ...prev, dataSource: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_SOURCES.map((source) => (
                        <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rainfall">Predicted Rainfall (mm)</Label>
                  <Input
                    id="rainfall"
                    type="number"
                    placeholder="50"
                    value={form.predictedRainfall}
                    onChange={(e) => setForm(prev => ({ ...prev, predictedRainfall: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Prediction Period (days)</Label>
                  <Input
                    id="period"
                    type="number"
                    placeholder="7"
                    value={form.predictionPeriod}
                    onChange={(e) => setForm(prev => ({ ...prev, predictionPeriod: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence">Confidence (%)</Label>
                  <div className="space-y-2">
                    <Input
                      id="confidence"
                      type="number"
                      placeholder="80"
                      value={form.confidence}
                      onChange={(e) => setForm(prev => ({ ...prev, confidence: e.target.value }))}
                    />
                    <Progress value={Number(form.confidence)} className="w-full" />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSubmitPrediction}
                className="w-full"
                disabled={!form.location || !form.predictedRainfall || !form.dataSource || isWriting}
              >
                {isWriting ? 'Submitting...' : 'Submit Prediction'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validate Prediction</CardTitle>
              <CardDescription>
                Compare predicted rainfall with actual measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valLocation">Location</Label>
                  <Select value={validationForm.location} onValueChange={(value) => setValidationForm(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_LOCATIONS.map((location) => (
                        <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="predictionIndex">Prediction Index</Label>
                  <Input
                    id="predictionIndex"
                    type="number"
                    placeholder="0"
                    value={validationForm.predictionIndex}
                    onChange={(e) => setValidationForm(prev => ({ ...prev, predictionIndex: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualRainfall">Actual Rainfall (mm)</Label>
                  <Input
                    id="actualRainfall"
                    type="number"
                    placeholder="45"
                    value={validationForm.actualRainfall}
                    onChange={(e) => setValidationForm(prev => ({ ...prev, actualRainfall: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleValidatePrediction}
                className="w-full"
                disabled={!validationForm.location || !validationForm.actualRainfall || isWriting}
              >
                {isWriting ? 'Validating...' : 'Validate Prediction'}
              </Button>
            </CardContent>
          </Card>

          {/* Accuracy Display */}
          {accuracy && (
            <Card>
              <CardHeader>
                <CardTitle>Prediction Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{accuracy.totalPredictions.toString()}</div>
                    <div className="text-sm text-muted-foreground">Total Predictions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{accuracy.accuratePredictions.toString()}</div>
                    <div className="text-sm text-muted-foreground">Accurate Predictions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatPercentage(accuracy.averageError)}</div>
                    <div className="text-sm text-muted-foreground">Average Error</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="premium" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premium Impact Calculator</CardTitle>
              <CardDescription>
                See how weather predictions affect insurance premiums
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coverage">Coverage Amount (cUSD)</Label>
                  <Input
                    id="coverage"
                    type="number"
                    placeholder="1000"
                    value={premiumForm.coverageAmount}
                    onChange={(e) => setPremiumForm(prev => ({ ...prev, coverageAmount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="premiumLocation">Location</Label>
                  <Select value={premiumForm.location} onValueChange={(value) => setPremiumForm(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_LOCATIONS.map((location) => (
                        <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crop">Crop Type</Label>
                  <Select value={premiumForm.cropType} onValueChange={(value) => setPremiumForm(prev => ({ ...prev, cropType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maize">Maize</SelectItem>
                      <SelectItem value="Coffee">Coffee</SelectItem>
                      <SelectItem value="Tea">Tea</SelectItem>
                      <SelectItem value="Rice">Rice</SelectItem>
                      <SelectItem value="Wheat">Wheat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threshold">Rainfall Threshold (mm)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="80"
                    value={premiumForm.rainfallThreshold}
                    onChange={(e) => setPremiumForm(prev => ({ ...prev, rainfallThreshold: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleCalculatePremium} className="w-full">
                Calculate Premium Impact
              </Button>
            </CardContent>
          </Card>

          {/* Premium Adjustment Result */}
          {premiumAdjustment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Premium Adjustment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatPrice(premiumAdjustment.basePremium)}</div>
                    <div className="text-sm text-muted-foreground">Base Premium</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${premiumAdjustment.predictionAdjustment > 0n ? 'text-red-600' : 'text-green-600'}`}>
                      {premiumAdjustment.predictionAdjustment > 0n ? '+' : ''}{formatPrice(premiumAdjustment.predictionAdjustment)}
                    </div>
                    <div className="text-sm text-muted-foreground">Prediction Adjustment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatPrice(premiumAdjustment.finalPremium)}</div>
                    <div className="text-sm text-muted-foreground">Final Premium</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm"><strong>Reasoning:</strong> {premiumAdjustment.reasoning}</p>
                  <p className="text-sm mt-2"><strong>Confidence:</strong> {formatPercentage(premiumAdjustment.confidence)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Prediction #{index}</span>
                    <Badge className={getConfidenceColor(prediction.confidence)}>
                      {formatPercentage(prediction.confidence)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {prediction.dataSource}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{prediction.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      <span className="font-semibold">{prediction.predictedRainfall.toString()}mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{new Date(Number(prediction.timestamp) * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Period: {prediction.predictionPeriod.toString()} days</span>
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
