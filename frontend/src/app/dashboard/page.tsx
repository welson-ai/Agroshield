'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Dashboard() {
  const [coverageAmount, setCoverageAmount] = useState('')
  const [rainfallThreshold, setRainfallThreshold] = useState('')
  const [measurementPeriod, setMeasurementPeriod] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
          <p className="text-gray-600">Manage your crop insurance policies</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create Policy */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Policy</CardTitle>
                <CardDescription>
                  Purchase parametric insurance for your crops
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coverage">Coverage Amount (cUSD)</Label>
                    <Input
                      id="coverage"
                      type="number"
                      placeholder="1000"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="threshold">Rainfall Threshold (mm)</Label>
                    <Input
                      id="threshold"
                      type="number"
                      placeholder="50"
                      value={rainfallThreshold}
                      onChange={(e) => setRainfallThreshold(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="period">Measurement Period (days)</Label>
                  <Input
                    id="period"
                    type="number"
                    placeholder="30"
                    value={measurementPeriod}
                    onChange={(e) => setMeasurementPeriod(e.target.value)}
                  />
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Create Policy
                </Button>
              </CardContent>
            </Card>

            {/* Active Policies */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Active Policies</CardTitle>
                <CardDescription>
                  Currently active insurance policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-4">🌾</div>
                  <p>No active policies found</p>
                  <p className="text-sm">Create your first policy above</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">1.</span>
                  <p>Set coverage amount and rainfall threshold</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">2.</span>
                  <p>Pay premium in cUSD tokens</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">3.</span>
                  <p>Oracle monitors weather conditions</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">4.</span>
                  <p>Automatic payout if threshold breached</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
