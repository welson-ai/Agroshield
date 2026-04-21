'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAgroShieldOracle } from '@/hooks'
import { useAccount } from 'wagmi'

// Admin page component for protocol management
export default function AdminPage() {
  const { address } = useAccount()
  const { submitWeatherData, isWriting } = useAgroShieldOracle()
  const [location, setLocation] = useState('')
  const [rainfall, setRainfall] = useState('')
  const [temperature, setTemperature] = useState('')
  const [humidity, setHumidity] = useState('')

  const handleSubmitWeatherData = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    if (!location || !rainfall || !temperature || !humidity) {
      alert('Please fill in all fields')
      return
    }

    try {
      await submitWeatherData(
        location,
        Math.floor(Date.now() / 1000).toString(), // Convert to seconds
        rainfall,
        temperature,
        humidity
      )
      
      // Clear form
      setLocation('')
      setRainfall('')
      setTemperature('')
      setHumidity('')
      
      alert('Weather data submitted successfully!')
    } catch (error) {
      console.error('Failed to submit weather data:', error)
      alert('Failed to submit weather data. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage protocol and submit weather data</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weather Data Submission */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit Weather Data</CardTitle>
                <CardDescription>
                  Submit weather data for automatic policy payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location ID</Label>
                    <Input
                      id="location"
                      type="number"
                      placeholder="1001"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rainfall">Rainfall (mm)</Label>
                    <Input
                      id="rainfall"
                      type="number"
                      placeholder="25.5"
                      value={rainfall}
                      onChange={(e) => setRainfall(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      placeholder="28"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input
                      id="humidity"
                      type="number"
                      placeholder="65"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubmitWeatherData}
                  disabled={isWriting}
                >
                  {isWriting ? 'Submitting...' : 'Submit Weather Data'}
                </Button>
              </CardContent>
            </Card>

            {/* Contract Management */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contract Management</CardTitle>
                <CardDescription>
                  Protocol configuration and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    Update Premium Rate
                  </Button>
                  <Button variant="outline" className="w-full">
                    Update Reserve Ratio
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    Pause Protocol
                  </Button>
                  <Button variant="outline" className="w-full">
                    Emergency Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Protocol Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Protocol Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Policies</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Policies</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Coverage</span>
                  <span className="font-semibold">0 cUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Premiums</span>
                  <span className="font-semibold">0 cUSD</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pool Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Liquidity</span>
                  <span className="font-semibold">0 cUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reserve Fund</span>
                  <span className="font-semibold">0 cUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Claims Paid</span>
                  <span className="font-semibold">0 cUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protocol Revenue</span>
                  <span className="font-semibold">0 cUSD</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-4">📊</div>
                  <p>No recent activity</p>
                  <p className="text-sm">Activity will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
