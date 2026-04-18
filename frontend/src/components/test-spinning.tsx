'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTransactionSpinning } from '@/hooks/useTransactionSpinning'
import { Zap, Play, Square, RotateCcw } from 'lucide-react'

export function TestSpinning() {
  const { 
    isSpinning, 
    spinningStats, 
    quickSpin, 
    stopSpinning, 
    clearTransactions,
    activeTransactions 
  } = useTransactionSpinning()

  const [testResult, setTestResult] = useState<string>('')

  const runTest = async () => {
    setTestResult('Testing transaction spinning...')
    
    try {
      // Test liquidity spinning with minimal parameters
      await quickSpin('liquiditySpinning')
      setTestResult('Test started successfully! Check console for details.')
    } catch (error) {
      console.error('Test failed:', error)
      setTestResult(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getSuccessRate = () => {
    if (spinningStats.totalTransactions === 0) return 0
    return (spinningStats.successfulTransactions / spinningStats.totalTransactions) * 100
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Transaction Spinning Test</h1>
      </div>

      {/* Test Status */}
      <Card>
        <CardHeader>
          <CardTitle>Test Status</CardTitle>
          <CardDescription>
            Simple test to verify transaction spinning functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSpinning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isSpinning ? 'Spinning Active' : 'Spinning Inactive'}</span>
            </div>
            
            {testResult && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{testResult}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={runTest} disabled={isSpinning}>
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
              <Button onClick={() => stopSpinning()} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
              <Button onClick={() => clearTransactions()} variant="destructive">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{spinningStats.totalTransactions}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{spinningStats.successfulTransactions}</div>
              <div className="text-sm text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{spinningStats.failedTransactions}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getSuccessRate().toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sequences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from(activeTransactions.entries()).map(([configId, transactions]) => (
              <div key={configId} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{configId}</span>
                  <div className="text-sm text-muted-foreground">
                    {transactions.length} transactions
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  Success: {transactions.filter(tx => tx.status === 'success').length} | 
                  Failed: {transactions.filter(tx => tx.status === 'failed').length} | 
                  Pending: {transactions.filter(tx => tx.status === 'pending').length}
                </div>
              </div>
            ))}
            {activeTransactions.size === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No active spinning sequences
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Total Value Transacted:</strong> {spinningStats.totalValueTransacted} cUSD</div>
            <div><strong>Total Gas Used:</strong> {spinningStats.totalGasUsed}</div>
            <div><strong>Active Transactions Map Size:</strong> {activeTransactions.size}</div>
            <div><strong>Is Writing:</strong> {isSpinning ? 'Yes' : 'No'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
