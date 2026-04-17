'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAgroShieldPolicy } from '@/hooks'
import { useTransactionToast } from '@/hooks'
import { DEMO_POLICIES } from '@/data/demo-policies'
import { Database, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface PolicyCreationResult {
  policy: any
  status: 'pending' | 'success' | 'error'
  txHash?: string
  error?: string
}

export function PolicySeeder() {
  const [isCreating, setIsCreating] = useState(false)
  const [results, setResults] = useState<PolicyCreationResult[]>([])
  const { createPolicy } = useAgroShieldPolicy()
  const { showSuccessToast, showErrorToast } = useTransactionToast()

  const createDemoPolicies = async () => {
    setIsCreating(true)
    const newResults: PolicyCreationResult[] = []

    for (const demoPolicy of DEMO_POLICIES) {
      const result: PolicyCreationResult = {
        policy: demoPolicy,
        status: 'pending'
      }
      
      setResults(prev => [...prev, result])
      
      try {
        const txHash = await createPolicy(
          demoPolicy.coverageAmount,
          demoPolicy.rainfallThreshold,
          demoPolicy.measurementPeriod,
          `${demoPolicy.location.lat},${demoPolicy.location.lon}`
        )

        if (txHash) {
          result.status = 'success'
          result.txHash = txHash
          showSuccessToast(`Created ${demoPolicy.cropType} policy`, txHash)
        } else {
          result.status = 'error'
          result.error = 'Transaction failed'
        }
      } catch (error) {
        result.status = 'error'
        result.error = error instanceof Error ? error.message : 'Unknown error'
        showErrorToast(`Failed to create ${demoPolicy.cropType} policy`)
      }

      newResults.push(result)
      setResults(prev => [...prev.slice(0, -1), result])
      
      // Small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    setIsCreating(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const pendingCount = results.filter(r => r.status === 'pending').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Policy Seeder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Create Demo Policies</h4>
          <p className="text-sm text-blue-700 mb-3">
            This will create 5 demo policies on Celo mainnet with realistic data:
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li> maize - Kitale (1000 cUSD coverage)</li>
            <li> coffee - Nyeri (2500 cUSD coverage)</li>
            <li> tea - Kericho (3000 cUSD coverage)</li>
            <li> rice - Mwea (1500 cUSD coverage)</li>
            <li> wheat - Narok (2000 cUSD coverage)</li>
          </ul>
          <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
            <strong>Note:</strong> This will create real transactions on Celo mainnet. 
            Ensure you have sufficient CELO for gas fees.
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={createDemoPolicies}
            disabled={isCreating}
            className="flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Policies...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Create Demo Policies
              </>
            )}
          </Button>

          {results.length > 0 && (
            <div className="flex gap-2 text-sm">
              <span className="text-green-600">Success: {successCount}</span>
              <span className="text-red-600">Error: {errorCount}</span>
              <span className="text-blue-600">Pending: {pendingCount}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Results:</h4>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.policy.cropType} Policy</div>
                      <div className="text-sm text-gray-600">
                        {result.policy.location.name} - {result.policy.coverageAmount} cUSD
                      </div>
                      {result.txHash && (
                        <div className="text-xs text-blue-600">
                          TX: {result.txHash.slice(0, 8)}...{result.txHash.slice(-6)}
                        </div>
                      )}
                      {result.error && (
                        <div className="text-xs text-red-600">{result.error}</div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
