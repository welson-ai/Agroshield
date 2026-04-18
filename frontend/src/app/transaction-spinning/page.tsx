import { TransactionSpinningDashboard } from '@/components/transaction-spinning-dashboard'

export default function TransactionSpinningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <TransactionSpinningDashboard />
    </div>
  )
}
