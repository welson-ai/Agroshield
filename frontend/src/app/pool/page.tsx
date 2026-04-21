import { LiquidityPool } from '@/components/liquidity-pool'

// Pool page component for liquidity management
export default function PoolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <LiquidityPool />
    </div>
  )
}
