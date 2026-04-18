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
import { useTransactionSpinning } from '@/hooks/useTransactionSpinning'
import { formatEther } from 'viem'
import { Play, Pause, Square, RotateCcw, Zap, TrendingUp, DollarSign, Shield, Coins, BarChart3 } from 'lucide-react'

export function TransactionSpinningDashboard() {
  const {
    isSpinning,
    startSpinning,
    stopSpinning,
    quickSpin,
    clearTransactions,
    activeTransactions,
    spinningStats,
    getTransactionStatus,
    presetConfigs
  } = useTransactionSpinning()

  const [customConfig, setCustomConfig] = useState({
    contract: 'POOL',
    functionName: 'provideLiquidity',
    amount: '100',
    interval: '2000',
    count: '10',
    autoWithdraw: true
  })

  const [selectedPreset, setSelectedPreset] = useState('')

  const handleQuickSpin = async (type: string) => {
    try {
      await quickSpin(type as keyof typeof presetConfigs)
    } catch (error) {
      console.error('Quick spin failed:', error)
    }
  }

  const handleCustomSpin = async () => {
    try {
      const config = {
        id: `custom-${Date.now()}`,
        contract: customConfig.contract as any,
        functionName: customConfig.functionName,
        args: customConfig.contract === 'POOL' ? [parseEther(customConfig.amount)] : [],
        value: customConfig.amount,
        interval: parseInt(customConfig.interval),
        count: parseInt(customConfig.count),
        autoWithdraw: customConfig.autoWithdraw
      }
      
      await startSpinning([config])
    } catch (error) {
      console.error('Custom spin failed:', error)
    }
  }

  const handleStopSpinning = (configId?: string) => {
    stopSpinning(configId)
  }

  const getSuccessRate = () => {
    if (spinningStats.totalTransactions === 0) return 0
    return (spinningStats.successfulTransactions / spinningStats.totalTransactions) * 100
  }

  const formatNumber = (num: string) => {
    return parseFloat(num).toLocaleString()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Transaction Spinning Dashboard</h1>
        {isSpinning && <Badge className="bg-green-500 animate-pulse">ACTIVE</Badge>}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(spinningStats.totalTransactions.toString())}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNumber(spinningStats.successfulTransactions.toString())}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatNumber(spinningStats.failedTransactions.toString())}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSuccessRate().toFixed(1)}%</div>
            <Progress value={getSuccessRate()} className="w-full mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(spinningStats.totalValueTransacted)} cUSD</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="presets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="presets">Quick Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom Config</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Liquidity Spinning */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Liquidity Spinning
                </CardTitle>
                <CardDescription>
                  Rapid liquidity provision with auto-withdraw
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Amount:</strong> 100 cUSD
                  </div>
                  <div className="text-sm">
                    <strong>Interval:</strong> 2s
                  </div>
                  <div className="text-sm">
                    <strong>Count:</strong> 10 tx
                  </div>
                  <div className="text-sm">
                    <strong>Auto-withdraw:</strong> ✅
                  </div>
                  <Button 
                    onClick={() => handleQuickSpin('liquiditySpinning')}
                    disabled={isSpinning}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Policy Spinning */}
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Policy Spinning
                </CardTitle>
                <CardDescription>
                  Create multiple policies rapidly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Premium:</strong> 100 cUSD
                  </div>
                  <div className="text-sm">
                    <strong>Interval:</strong> 3s
                  </div>
                  <div className="text-sm">
                    <strong>Count:</strong> 5 tx
                  </div>
                  <div className="text-sm">
                    <strong>Coverage:</strong> 1000 cUSD
                  </div>
                  <Button 
                    onClick={() => handleQuickSpin('policySpinning')}
                    disabled={isSpinning}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Staking Spinning */}
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-purple-600" />
                  Staking Spinning
                </CardTitle>
                <CardDescription>
                  Create stake positions and claim rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Amount:</strong> 1000 cUSD
                  </div>
                  <div className="text-sm">
                    <strong>Interval:</strong> 5s
                  </div>
                  <div className="text-sm">
                    <strong>Count:</strong> 3 tx
                  </div>
                  <div className="text-sm">
                    <strong>Tier:</strong> Bronze
                  </div>
                  <Button 
                    onClick={() => handleQuickSpin('stakingSpinning')}
                    disabled={isSpinning}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Spinning */}
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Marketplace Spinning
                </CardTitle>
                <CardDescription>
                  Make rapid offers on marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Offer:</strong> 1500 cUSD
                  </div>
                  <div className="text-sm">
                    <strong>Interval:</strong> 4s
                  </div>
                  <div className="text-sm">
                    <strong>Count:</strong> 3 tx
                  </div>
                  <div className="text-sm">
                    <strong>Policy:</strong> #1
                  </div>
                  <Button 
                    onClick={() => handleQuickSpin('marketplaceSpinning')}
                    disabled={isSpinning}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Global Controls */}
          <Card className="md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Global Controls
              </CardTitle>
            </CardHeader>
              <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={() => stopSpinning()}
                  disabled={!isSpinning}
                  variant="destructive"
                  size="lg"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop All Spinning
                </Button>
                <Button 
                  onClick={() => clearTransactions()}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Custom Transaction Configuration</CardTitle>
              <CardDescription>
                Create your own transaction spinning sequence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract">Contract</Label>
                  <Select value={customConfig.contract} onValueChange={(value) => setCustomConfig(prev => ({ ...prev, contract: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POOL">Pool</SelectItem>
                      <SelectItem value="POLICY">Policy</SelectItem>
                      <SelectItem value="MARKETPLACE">Marketplace</SelectItem>
                      <SelectItem value="STAKING">Staking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="function">Function</Label>
                  <Input
                    id="function"
                    placeholder="provideLiquidity"
                    value={customConfig.functionName}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, functionName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (cUSD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100"
                    value={customConfig.amount}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Interval (ms)</Label>
                  <Input
                    id="interval"
                    type="number"
                    placeholder="2000"
                    value={customConfig.interval}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, interval: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="count">Transaction Count</Label>
                  <Input
                    id="count"
                    type="number"
                    placeholder="10"
                    value={customConfig.count}
                    onChange={(e) => setCustomConfig(prev => ({ ...prev, count: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="autoWithdraw">Auto-Withdraw</Label>
                  <Select value={customConfig.autoWithdraw.toString()} onValueChange={(value) => setCustomConfig(prev => ({ ...prev, autoWithdraw: value === 'true' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-withdraw" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCustomSpin}
                disabled={isSpinning}
                className="w-full"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Custom Spinning
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from(activeTransactions.entries()).map(([configId, transactions]) => (
              <Card key={configId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Spinning: {configId}</span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStopSpinning(configId)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => clearTransactions(configId)}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {transactions.filter(tx => tx.status === 'success').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Success</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">
                          {transactions.filter(tx => tx.status === 'pending').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">
                          {transactions.filter(tx => tx.status === 'failed').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                      </div>
                    </div>

                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {transactions.slice(-5).reverse().map((tx, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                          <span className="font-mono text-xs">
                            {tx.hash.slice(0, 10)}...
                          </span>
                          <Badge variant={
                            tx.status === 'success' ? 'default' : 
                            tx.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {tx.status}
                          </Badge>
                        </div>
                      ))}
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
