import { useState, useEffect } from 'react'
import { DEMO_POLICIES, KENYA_REGIONS, DemoPolicy } from '@/data/demo-policies'

export function useDemoData() {
  const [demoPolicies, setDemoPolicies] = useState<DemoPolicy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDemoData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setDemoPolicies(DEMO_POLICIES)
    } catch (err) {
      setError('Failed to load demo data')
    } finally {
      setIsLoading(false)
    }
  }

  const getPolicyById = (id: string): DemoPolicy | undefined => {
    return demoPolicies.find(policy => policy.id === id)
  }

  const getPoliciesByCrop = (cropType: string): DemoPolicy[] => {
    return demoPolicies.filter(policy => policy.cropType === cropType)
  }

  const getPoliciesByRegion = (region: string): DemoPolicy[] => {
    return demoPolicies.filter(policy => policy.location.region.includes(region))
  }

  const getActivePolicies = (): DemoPolicy[] => {
    return demoPolicies.filter(policy => policy.status === 'active')
  }

  const getTotalCoverage = (): number => {
    return demoPolicies.reduce((total, policy) => {
      return total + parseFloat(policy.coverageAmount)
    }, 0)
  }

  const getTotalPremiums = (): number => {
    return demoPolicies.reduce((total, policy) => {
      return total + parseFloat(policy.premium)
    }, 0)
  }

  useEffect(() => {
    loadDemoData()
  }, [])

  return {
    demoPolicies,
    isLoading,
    error,
    loadDemoData,
    getPolicyById,
    getPoliciesByCrop,
    getPoliciesByRegion,
    getActivePolicies,
    getTotalCoverage,
    getTotalPremiums,
    regions: KENYA_REGIONS
  }
}
