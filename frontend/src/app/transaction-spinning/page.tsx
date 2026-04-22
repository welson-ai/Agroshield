import { TransactionSpinningDashboard } from '@/components/transaction-spinning-dashboard'

// Transaction spinning page component for advanced transaction testing
export default function TransactionSpinningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <TransactionSpinningDashboard />
    </div>
  )
}
