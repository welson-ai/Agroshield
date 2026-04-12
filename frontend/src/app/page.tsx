import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-8 shadow-lg">
                <span className="text-white font-bold text-3xl">🌾</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              AgroShield
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Protect Your Harvest, <span className="text-green-600 font-semibold">Automatically</span>
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Parametric crop insurance powered by weather oracles. 
              No claims process, no delays - just protection when you need it most.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4 shadow-lg">
                  Launch App
                </Button>
              </Link>
              <Link href="/pool">
                <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 text-lg px-8 py-4">
                  Provide Liquidity
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Simple, transparent, and automated crop protection
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <CardTitle className="text-xl">Create Policy</CardTitle>
                <CardDescription>
                  Set your coverage amount and rainfall threshold. 
                  Choose your crop type and measurement period.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">2️⃣</span>
                </div>
                <CardTitle className="text-xl">Weather Monitoring</CardTitle>
                <CardDescription>
                  Our decentralized oracle monitors real-time weather data. 
                  Automatic triggers when conditions are met.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">3️⃣</span>
                </div>
                <CardTitle className="text-xl">Instant Payout</CardTitle>
                <CardDescription>
                  No paperwork, no waiting. 
                  Payouts are automatic and immediate.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Protocol Statistics
            </h2>
            <p className="text-lg text-gray-600">
              Real-time metrics from the AgroShield ecosystem
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-green-200">
              <CardContent className="text-center py-8">
                <div className="text-5xl font-bold text-green-600 mb-2">0</div>
                <div className="text-gray-700 font-medium">Total Insured</div>
                <div className="text-sm text-gray-500 mt-1">cUSD coverage</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-blue-200">
              <CardContent className="text-center py-8">
                <div className="text-5xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-gray-700 font-medium">Active Policies</div>
                <div className="text-sm text-gray-500 mt-1">Currently protected</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-purple-200">
              <CardContent className="text-center py-8">
                <div className="text-5xl font-bold text-purple-600 mb-2">0</div>
                <div className="text-gray-700 font-medium">Payouts Made</div>
                <div className="text-sm text-gray-500 mt-1">Automatic claims</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-orange-200">
              <CardContent className="text-center py-8">
                <div className="text-5xl font-bold text-orange-600 mb-2">0</div>
                <div className="text-gray-700 font-medium">TVL</div>
                <div className="text-sm text-gray-500 mt-1">Total Value Locked</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Protect Your Harvest?
            </h2>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Join thousands of farmers using decentralized crop insurance. 
              No paperwork, instant payouts, and transparent protection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4">
                  Get Started
                </Button>
              </Link>
              <Link href="/pool">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 text-lg px-8 py-4">
                  Provide Liquidity
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex justify-center space-x-8">
              <div className="flex items-center text-white/80">
                <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                <span className="text-sm">Built on Celo</span>
              </div>
              <div className="flex items-center text-white/80">
                <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                <span className="text-sm">Audited Contracts</span>
              </div>
              <div className="flex items-center text-white/80">
                <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                <span className="text-sm">Weather Oracles</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
