import { TransactionSpinningDashboard } from '@/components/transaction-spinning-dashboard'

// Transaction spinning page component for advanced transaction testing
export default function TransactionSpinningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 p-8">
      <TransactionSpinningDashboard />
    </div>
  )
}
